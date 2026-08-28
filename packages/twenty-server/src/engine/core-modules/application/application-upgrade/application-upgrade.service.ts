import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import axios from 'axios';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';
import { z } from 'zod';

import {
  WorkspaceIteratorService,
  type WorkspaceIteratorReport,
} from 'src/database/commands/command-runners/workspace-iterator.service';
import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationState } from 'src/engine/core-modules/application/enums/application-state.enum';
import {
  UPGRADE_APPLICATION_JOB_NAME,
  type UpgradeApplicationJobData,
} from 'src/engine/core-modules/application/jobs/upgrade-application.job-constants';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceVersionService } from 'src/engine/workspace-manager/workspace-version/services/workspace-version.service';

const npmPackageMetadataSchema = z.object({
  version: z.string(),
});

@Injectable()
export class ApplicationUpgradeService {
  private readonly logger = new Logger(ApplicationUpgradeService.name);

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly appRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly applicationInstallService: ApplicationInstallService,
    private readonly applicationService: ApplicationService,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly workspaceQueueService: MessageQueueService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceVersionService: WorkspaceVersionService,
  ) {}

  async checkForUpdates(
    appRegistration: ApplicationRegistrationEntity,
  ): Promise<string | null> {
    if (appRegistration.sourceType !== ApplicationRegistrationSourceType.NPM) {
      return null;
    }

    const registryUrl = this.twentyConfigService.get('APP_REGISTRY_URL');

    if (!appRegistration.sourcePackage) {
      return null;
    }

    try {
      const encodedPackage = encodeURIComponent(appRegistration.sourcePackage);

      const { data } = await axios.get(
        `${registryUrl}/${encodedPackage}/latest`,
        {
          headers: { 'User-Agent': 'Twenty-AppUpgrade' },
          timeout: 10_000,
        },
      );

      const parsed = npmPackageMetadataSchema.safeParse(data);

      if (!parsed.success) {
        this.logger.warn(
          `Unexpected response shape from registry for ${appRegistration.sourcePackage}`,
        );

        return null;
      }

      const isNewVersion =
        await this.applicationRegistrationService.setLatestAvailableVersionIfChanged(
          appRegistration.id,
          parsed.data.version,
        );

      if (isNewVersion) {
        this.applicationRegistrationService.emitRegistrationPublishMetric({
          isNewRegistration: false,
          universalIdentifier: appRegistration.universalIdentifier,
          name: appRegistration.name,
          sourceType: appRegistration.sourceType,
          version: parsed.data.version,
        });

        await this.applicationRegistrationService.enqueueAutoUpgradeApplications(
          appRegistration.id,
        );
      }

      return parsed.data.version;
    } catch (error) {
      this.logger.warn(
        `Failed to check updates for ${appRegistration.sourcePackage}: ${error}`,
      );

      return null;
    }
  }

  async checkAllForUpdates(): Promise<void> {
    const npmRegistrations = await this.appRegistrationRepository.find({
      where: { sourceType: ApplicationRegistrationSourceType.NPM },
    });

    for (const registration of npmRegistrations) {
      await this.checkForUpdates(registration);
    }
  }

  async findApplicationsToUpgrade({
    applicationRegistrationId,
    onlyAutoUpgrade = false,
    workspaceIds,
    workspaceCountLimit,
  }: {
    applicationRegistrationId: string;
    onlyAutoUpgrade?: boolean;
    workspaceIds?: string[];
    workspaceCountLimit?: number;
  }): Promise<{
    appRegistration: ApplicationRegistrationEntity;
    targetVersion: string | null;
    applicationsToUpgrade: ApplicationEntity[];
    skippedNonProvisionedWorkspaceIds: string[];
  }> {
    const appRegistration = await this.appRegistrationRepository.findOneOrFail({
      where: { id: applicationRegistrationId },
    });

    const targetVersion = appRegistration.latestAvailableVersion;

    if (!isDefined(targetVersion)) {
      return {
        appRegistration,
        targetVersion: null,
        applicationsToUpgrade: [],
        skippedNonProvisionedWorkspaceIds: [],
      };
    }

    const applications = await this.applicationRepository.find({
      where: {
        applicationRegistrationId,
        ...(onlyAutoUpgrade ? { autoUpgrade: true } : {}),
        ...(isNonEmptyArray(workspaceIds)
          ? { workspaceId: In(workspaceIds) }
          : {}),
      },
    });

    const outdatedApplications = applications.filter(
      (application) => application.version !== targetVersion,
    );

    const provisionedWorkspaceIds = new Set(
      await this.workspaceVersionService.getProvisionedWorkspaceIds(),
    );

    const provisionedApplications = outdatedApplications.filter((application) =>
      provisionedWorkspaceIds.has(application.workspaceId),
    );

    const skippedNonProvisionedWorkspaceIds = outdatedApplications
      .filter(
        (application) => !provisionedWorkspaceIds.has(application.workspaceId),
      )
      .map((application) => application.workspaceId);

    const applicationsToUpgrade = isDefined(workspaceCountLimit)
      ? provisionedApplications.slice(0, workspaceCountLimit)
      : provisionedApplications;

    return {
      appRegistration,
      targetVersion,
      applicationsToUpgrade,
      skippedNonProvisionedWorkspaceIds,
    };
  }

  async upgradeApplications({
    appRegistration,
    targetVersion,
    applications,
  }: {
    appRegistration: ApplicationRegistrationEntity;
    targetVersion: string;
    applications: ApplicationEntity[];
  }): Promise<WorkspaceIteratorReport> {
    // An empty workspace id list makes the iterator fall back to every
    // provisioned workspace, which would upgrade workspaces that were
    // filtered out.
    if (!isNonEmptyArray(applications)) {
      return { success: [], fail: [], interrupted: false };
    }

    return this.workspaceIteratorService.iterate({
      workspaceIds: applications.map((application) => application.workspaceId),
      callback: async ({ workspaceId }) => {
        await this.upgradeApplicationToVersion({
          appRegistration,
          targetVersion,
          workspaceId,
        });
      },
    });
  }

  async upgradeAllApplications({
    applicationRegistrationId,
    onlyAutoUpgrade = false,
    workspaceIds,
    workspaceCountLimit,
  }: {
    applicationRegistrationId: string;
    onlyAutoUpgrade?: boolean;
    workspaceIds?: string[];
    workspaceCountLimit?: number;
  }): Promise<void> {
    const { appRegistration, targetVersion, applicationsToUpgrade } =
      await this.findApplicationsToUpgrade({
        applicationRegistrationId,
        onlyAutoUpgrade,
        workspaceIds,
        workspaceCountLimit,
      });

    if (!isDefined(targetVersion)) {
      return;
    }

    await this.upgradeApplications({
      appRegistration,
      targetVersion,
      applications: applicationsToUpgrade,
    });
  }

  async enqueueApplicationUpgrade(params: {
    appRegistrationId: string;
    targetVersion: string;
    workspaceId: string;
  }): Promise<boolean> {
    const appRegistration = await this.appRegistrationRepository.findOneOrFail({
      where: { id: params.appRegistrationId },
    });

    if (
      appRegistration.sourceType === ApplicationRegistrationSourceType.LOCAL ||
      appRegistration.sourceType ===
        ApplicationRegistrationSourceType.OAUTH_ONLY
    ) {
      throw new ApplicationException(
        'Cannot upgrade an app installed from a local source or OAuth-only registration',
        ApplicationExceptionCode.UPGRADE_FAILED,
      );
    }

    const application = await this.applicationService.findByUniversalIdentifier(
      {
        universalIdentifier: appRegistration.universalIdentifier,
        workspaceId: params.workspaceId,
      },
    );

    if (!isDefined(application)) {
      throw new ApplicationException(
        `Application ${appRegistration.universalIdentifier} is not installed in workspace ${params.workspaceId}`,
        ApplicationExceptionCode.APP_NOT_INSTALLED,
      );
    }

    if (application.state !== ApplicationState.INSTALLED) {
      throw new ApplicationException(
        `An operation is already in progress for application ${appRegistration.universalIdentifier}`,
        ApplicationExceptionCode.APPLICATION_OPERATION_IN_PROGRESS,
      );
    }

    await this.applicationService.update(application.id, {
      state: ApplicationState.UPGRADING,
      workspaceId: params.workspaceId,
    });

    try {
      await this.workspaceQueueService.add<UpgradeApplicationJobData>(
        UPGRADE_APPLICATION_JOB_NAME,
        {
          appRegistrationId: params.appRegistrationId,
          targetVersion: params.targetVersion,
          workspaceId: params.workspaceId,
        },
      );
    } catch (error) {
      await this.revertUpgradeStateBestEffort({
        appRegistrationId: params.appRegistrationId,
        workspaceId: params.workspaceId,
      });

      throw error;
    }

    return true;
  }

  async runEnqueuedUpgrade(params: {
    appRegistrationId: string;
    targetVersion: string;
    workspaceId: string;
  }): Promise<void> {
    try {
      await this.upgradeApplication(params);
    } catch (error) {
      await this.revertUpgradeStateBestEffort(params);

      throw error;
    }
  }

  private async revertUpgradeStateBestEffort(params: {
    appRegistrationId: string;
    workspaceId: string;
  }): Promise<void> {
    try {
      const appRegistration = await this.appRegistrationRepository.findOne({
        where: { id: params.appRegistrationId },
      });

      if (!isDefined(appRegistration)) {
        return;
      }

      const application =
        await this.applicationService.findByUniversalIdentifier({
          universalIdentifier: appRegistration.universalIdentifier,
          workspaceId: params.workspaceId,
        });

      if (
        !isDefined(application) ||
        application.state !== ApplicationState.UPGRADING
      ) {
        return;
      }

      await this.applicationService.update(application.id, {
        state: ApplicationState.INSTALLED,
        workspaceId: params.workspaceId,
      });
    } catch (revertError) {
      this.logger.warn(
        `Failed to revert upgrade state for registration ${params.appRegistrationId} in workspace ${params.workspaceId}`,
        revertError,
      );
    }
  }

  async upgradeApplication(params: {
    appRegistrationId: string;
    targetVersion: string;
    workspaceId: string;
    skipWorkspaceCompatibilityCheck?: boolean;
  }): Promise<boolean> {
    const appRegistration = await this.appRegistrationRepository.findOneOrFail({
      where: { id: params.appRegistrationId },
    });

    return this.upgradeApplicationToVersion({
      appRegistration,
      targetVersion: params.targetVersion,
      workspaceId: params.workspaceId,
      skipWorkspaceCompatibilityCheck: params.skipWorkspaceCompatibilityCheck,
    });
  }

  private async upgradeApplicationToVersion(params: {
    appRegistration: ApplicationRegistrationEntity;
    targetVersion: string;
    workspaceId: string;
    skipWorkspaceCompatibilityCheck?: boolean;
  }): Promise<boolean> {
    const { appRegistration } = params;

    // LOCAL apps are updated by dev sync and OAUTH_ONLY registrations have no
    // code artifacts.
    if (
      appRegistration.sourceType === ApplicationRegistrationSourceType.LOCAL ||
      appRegistration.sourceType ===
        ApplicationRegistrationSourceType.OAUTH_ONLY
    ) {
      throw new ApplicationException(
        'Cannot upgrade an app installed from a local source or OAuth-only registration',
        ApplicationExceptionCode.UPGRADE_FAILED,
      );
    }

    try {
      return await this.applicationInstallService.installApplication({
        appRegistrationId: appRegistration.id,
        version: params.targetVersion,
        workspaceId: params.workspaceId,
        skipWorkspaceCompatibilityCheck: params.skipWorkspaceCompatibilityCheck,
      });
    } catch (error) {
      const appName =
        appRegistration.sourcePackage ?? appRegistration.universalIdentifier;

      this.logger.error(`Upgrade failed for ${appName}`, error);

      if (error instanceof ApplicationException) {
        throw error;
      }

      throw new ApplicationException(
        `Upgrade failed for ${appName}`,
        ApplicationExceptionCode.UPGRADE_FAILED,
      );
    }
  }
}
