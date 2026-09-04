import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { isUniqueViolationError } from 'src/engine/core-modules/application/application-async-operation/utils/is-unique-violation-error.util';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { MarketplaceQueryService } from 'src/engine/core-modules/application/application-marketplace/marketplace-query.service';
import { ApplicationVersionValidationService } from 'src/engine/core-modules/application/application-package/application-version-validation.service';
import { VERSION_PROGRESSION_REASON_TO_INSTALL_EXCEPTION_CODE } from 'src/engine/core-modules/application/application-package/constants/version-reason-to-exception-code.constant';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationState } from 'src/engine/core-modules/application/enums/application-state.enum';
import {
  INSTALL_APPLICATIONS_JOB_NAME,
  type InstallApplicationsJobData,
} from 'src/engine/core-modules/application/jobs/install-applications.job-constants';
import {
  UNINSTALL_APPLICATION_JOB_NAME,
  type UninstallApplicationJobData,
} from 'src/engine/core-modules/application/jobs/uninstall-application.job-constants';
import {
  UPGRADE_APPLICATION_JOB_NAME,
  type UpgradeApplicationJobData,
} from 'src/engine/core-modules/application/jobs/upgrade-application.job-constants';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueJobData } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

@Injectable()
export class ApplicationAsyncOperationService {
  private readonly logger = new Logger(ApplicationAsyncOperationService.name);

  constructor(
    private readonly applicationService: ApplicationService,
    private readonly applicationSyncService: ApplicationSyncService,
    private readonly applicationVersionValidationService: ApplicationVersionValidationService,
    private readonly marketplaceQueryService: MarketplaceQueryService,
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async enqueueInstall({
    universalIdentifier,
    version,
    workspaceId,
  }: {
    universalIdentifier: string;
    version?: string;
    workspaceId: string;
  }): Promise<ApplicationEntity> {
    const appRegistration =
      await this.marketplaceQueryService.findRegistrationByUniversalIdentifier(
        universalIdentifier,
      );

    this.assertRegistrationIsInstallable({ appRegistration, workspaceId });

    const existingApplication =
      await this.applicationService.findByUniversalIdentifier({
        universalIdentifier,
        workspaceId,
      });

    this.assertVersionProgression({
      incomingVersion: version ?? appRegistration.latestAvailableVersion,
      currentVersion: existingApplication?.version,
      universalIdentifier,
    });

    const { application, compensate } = await this.requestInstall({
      existingApplication,
      appRegistration,
      workspaceId,
    });

    await this.enqueueOrCompensate<InstallApplicationsJobData>({
      jobName: INSTALL_APPLICATIONS_JOB_NAME,
      data: {
        applications: [
          {
            appRegistrationId: appRegistration.id,
            universalIdentifier,
            version,
          },
        ],
        isStateAlreadyTransitioned: true,
        workspaceId,
      },
      universalIdentifier,
      workspaceId,
      compensate,
    });

    return application;
  }

  async enqueueUpgrade({
    appRegistrationId,
    targetVersion,
    workspaceId,
  }: {
    appRegistrationId: string;
    targetVersion: string;
    workspaceId: string;
  }): Promise<ApplicationEntity> {
    const application =
      await this.applicationService.findByApplicationRegistrationId({
        applicationRegistrationId: appRegistrationId,
        workspaceId,
      });

    if (!isDefined(application)) {
      throw new ApplicationException(
        `No application installed for registration ${appRegistrationId} in workspace ${workspaceId}`,
        ApplicationExceptionCode.APP_NOT_INSTALLED,
      );
    }

    this.assertVersionProgression({
      incomingVersion: targetVersion,
      currentVersion: application.version,
      universalIdentifier: application.universalIdentifier,
    });

    const requestedApplication = await this.applicationService.transitionState({
      applicationId: application.id,
      universalIdentifier: application.universalIdentifier,
      workspaceId,
      expectedState: ApplicationState.INSTALLED,
      nextState: ApplicationState.UPGRADING,
    });

    await this.enqueueOrCompensate<UpgradeApplicationJobData>({
      jobName: UPGRADE_APPLICATION_JOB_NAME,
      data: {
        applicationId: requestedApplication.id,
        appRegistrationId,
        universalIdentifier: requestedApplication.universalIdentifier,
        targetVersion,
        workspaceId,
      },
      universalIdentifier: requestedApplication.universalIdentifier,
      workspaceId,
      compensate: () =>
        this.applicationService.transitionStateBestEffort({
          applicationId: requestedApplication.id,
          universalIdentifier: requestedApplication.universalIdentifier,
          workspaceId,
          expectedState: ApplicationState.UPGRADING,
          nextState: ApplicationState.INSTALLED,
        }),
    });

    return requestedApplication;
  }

  async enqueueUninstall({
    universalIdentifier,
    workspaceId,
  }: {
    universalIdentifier: string;
    workspaceId: string;
  }): Promise<ApplicationEntity> {
    const application = await this.applicationService.findByUniversalIdentifier(
      { universalIdentifier, workspaceId },
    );

    if (!isDefined(application)) {
      throw new ApplicationException(
        `Application ${universalIdentifier} is not installed in workspace ${workspaceId}`,
        ApplicationExceptionCode.APP_NOT_INSTALLED,
      );
    }

    if (!application.canBeUninstalled) {
      throw new ApplicationException(
        'This application cannot be uninstalled.',
        ApplicationExceptionCode.FORBIDDEN,
      );
    }

    const requestedApplication = await this.applicationService.transitionState({
      applicationId: application.id,
      universalIdentifier,
      workspaceId,
      expectedState: ApplicationState.INSTALLED,
      nextState: ApplicationState.UNINSTALLING,
    });

    await this.enqueueOrCompensate<UninstallApplicationJobData>({
      jobName: UNINSTALL_APPLICATION_JOB_NAME,
      data: {
        applicationId: requestedApplication.id,
        universalIdentifier,
        workspaceId,
      },
      universalIdentifier,
      workspaceId,
      compensate: () =>
        this.applicationService.transitionStateBestEffort({
          applicationId: requestedApplication.id,
          universalIdentifier,
          workspaceId,
          expectedState: ApplicationState.UNINSTALLING,
          nextState: ApplicationState.INSTALLED,
        }),
    });

    return requestedApplication;
  }

  private assertRegistrationIsInstallable({
    appRegistration,
    workspaceId,
  }: {
    appRegistration: ApplicationRegistrationEntity;
    workspaceId: string;
  }): void {
    if (
      appRegistration.sourceType === ApplicationRegistrationSourceType.LOCAL ||
      appRegistration.sourceType ===
        ApplicationRegistrationSourceType.OAUTH_ONLY
    ) {
      throw new ApplicationException(
        `Application registration ${appRegistration.universalIdentifier} has no code artifacts to install`,
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }

    if (
      appRegistration.sourceType ===
        ApplicationRegistrationSourceType.TARBALL &&
      !appRegistration.isListed &&
      !appRegistration.isPreInstalled &&
      appRegistration.ownerWorkspaceId !== workspaceId
    ) {
      throw new ApplicationException(
        `Application registration ${appRegistration.universalIdentifier} is not available for this workspace`,
        ApplicationExceptionCode.FORBIDDEN,
      );
    }
  }

  private assertVersionProgression({
    incomingVersion,
    currentVersion,
    universalIdentifier,
  }: {
    incomingVersion: string | null | undefined;
    currentVersion: string | null | undefined;
    universalIdentifier: string;
  }): void {
    if (!isDefined(incomingVersion) || !isDefined(currentVersion)) {
      return;
    }

    const progression =
      this.applicationVersionValidationService.validateVersionProgression({
        incomingVersion,
        currentVersion,
        universalIdentifier,
        action: 'install',
      });

    if (!progression.allowed) {
      throw new ApplicationException(
        progression.message,
        VERSION_PROGRESSION_REASON_TO_INSTALL_EXCEPTION_CODE[
          progression.reason
        ],
      );
    }
  }

  private async requestInstall({
    existingApplication,
    appRegistration,
    workspaceId,
  }: {
    existingApplication: ApplicationEntity | null;
    appRegistration: ApplicationRegistrationEntity;
    workspaceId: string;
  }): Promise<{
    application: ApplicationEntity;
    compensate: () => Promise<void>;
  }> {
    if (isDefined(existingApplication)) {
      const isRetryOfFailedInstall =
        existingApplication.state === ApplicationState.FAILED;

      const reservedFromState = isRetryOfFailedInstall
        ? ApplicationState.FAILED
        : ApplicationState.INSTALLED;

      const reservedToState = isRetryOfFailedInstall
        ? ApplicationState.INSTALLING
        : ApplicationState.UPGRADING;

      const application = await this.applicationService.transitionState({
        applicationId: existingApplication.id,
        universalIdentifier: appRegistration.universalIdentifier,
        workspaceId,
        expectedState: reservedFromState,
        nextState: reservedToState,
        failure: isRetryOfFailedInstall ? null : undefined,
      });

      return {
        application,
        compensate: () =>
          this.applicationService.transitionStateBestEffort({
            applicationId: application.id,
            universalIdentifier: appRegistration.universalIdentifier,
            workspaceId,
            expectedState: reservedToState,
            nextState: reservedFromState,
          }),
      };
    }

    const application = await this.createInstallPlaceholder({
      appRegistration,
      workspaceId,
    });

    return {
      application,
      compensate: () =>
        this.applicationSyncService
          .uninstallApplication({
            applicationUniversalIdentifier: appRegistration.universalIdentifier,
            workspaceId,
            shouldRunUninstallHook: false,
          })
          .then(() => undefined)
          .catch((error) => {
            this.logger.warn(
              `Placeholder cleanup did not complete for application ${appRegistration.universalIdentifier} in workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
            );
          }),
    };
  }

  private async createInstallPlaceholder({
    appRegistration,
    workspaceId,
  }: {
    appRegistration: ApplicationRegistrationEntity;
    workspaceId: string;
  }): Promise<ApplicationEntity> {
    try {
      return await this.applicationService.create({
        universalIdentifier: appRegistration.universalIdentifier,
        name: appRegistration.name,
        sourcePath: appRegistration.universalIdentifier,
        sourceType: appRegistration.sourceType,
        applicationRegistrationId: appRegistration.id,
        workspaceId,
        state: ApplicationState.INSTALLING,
      });
    } catch (error) {
      if (isUniqueViolationError(error)) {
        throw new ApplicationException(
          `Application ${appRegistration.universalIdentifier} is already being installed in workspace ${workspaceId}`,
          ApplicationExceptionCode.APPLICATION_OPERATION_IN_PROGRESS,
        );
      }

      throw error;
    }
  }

  private async enqueueOrCompensate<TJobData extends MessageQueueJobData>({
    jobName,
    data,
    universalIdentifier,
    workspaceId,
    compensate,
  }: {
    jobName: string;
    data: TJobData;
    universalIdentifier: string;
    workspaceId: string;
    compensate: () => Promise<void>;
  }): Promise<void> {
    try {
      await this.messageQueueService.add<TJobData>(jobName, data, {
        id: `${jobName}-${workspaceId}-${universalIdentifier}`,
        retryLimit: 0,
      });
    } catch (error) {
      await compensate();

      throw error;
    }

    this.logger.log(
      `Enqueued ${jobName} for application ${universalIdentifier} in workspace ${workspaceId}`,
    );
  }
}
