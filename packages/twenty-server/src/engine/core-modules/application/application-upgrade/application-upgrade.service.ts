import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import chunk from 'lodash.chunk';
import { type RoleManifestGrant } from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { ApplicationUpgradeRoleGrantService } from 'src/engine/core-modules/application/application-manifest/services/application-upgrade-role-grant.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import {
  UPGRADE_WORKSPACE_APPLICATION_JOB_ENQUEUE_BATCH_SIZE,
  UPGRADE_WORKSPACE_APPLICATION_JOB_NAME,
  UPGRADE_WORKSPACE_APPLICATION_JOB_OPTIONS,
  type UpgradeWorkspaceApplicationJobData,
} from 'src/engine/core-modules/application/jobs/upgrade-workspace-application.job-constants';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceVersionService } from 'src/engine/workspace-manager/workspace-version/services/workspace-version.service';

const isUpgradeRoleGrantsApprovalError = (error: unknown): boolean =>
  error instanceof ApplicationException &&
  error.code === ApplicationExceptionCode.UPGRADE_REQUIRES_ROLE_GRANTS_APPROVAL;

@Injectable()
export class ApplicationUpgradeService {
  private readonly logger = new Logger(ApplicationUpgradeService.name);

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly appRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly applicationInstallService: ApplicationInstallService,
    private readonly applicationUpgradeRoleGrantService: ApplicationUpgradeRoleGrantService,
    private readonly workspaceVersionService: WorkspaceVersionService,
    @InjectMessageQueue(MessageQueue.applicationUpgradeQueue)
    private readonly applicationUpgradeQueueService: MessageQueueService,
  ) {}

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

  async enqueueWorkspaceApplicationUpgrades({
    applicationRegistrationId,
    applications,
    onlyAutoUpgrade,
  }: {
    applicationRegistrationId: string;
    applications: ApplicationEntity[];
    onlyAutoUpgrade: boolean;
  }): Promise<string[]> {
    if (!isNonEmptyArray(applications)) {
      return [];
    }

    const jobIds: string[] = [];

    for (const applicationsBatch of chunk(
      applications,
      UPGRADE_WORKSPACE_APPLICATION_JOB_ENQUEUE_BATCH_SIZE,
    )) {
      const batchJobIds =
        await this.applicationUpgradeQueueService.bulkAdd<UpgradeWorkspaceApplicationJobData>(
          UPGRADE_WORKSPACE_APPLICATION_JOB_NAME,
          applicationsBatch.map((application) => ({
            data: {
              applicationRegistrationId,
              workspaceId: application.workspaceId,
              onlyAutoUpgrade,
            },
          })),
          UPGRADE_WORKSPACE_APPLICATION_JOB_OPTIONS,
        );

      jobIds.push(...batchJobIds);
    }

    return jobIds;
  }

  async enqueueApplicationUpgrades({
    applicationRegistrationId,
    onlyAutoUpgrade = false,
  }: {
    applicationRegistrationId: string;
    onlyAutoUpgrade?: boolean;
  }): Promise<string[]> {
    const { appRegistration, targetVersion, applicationsToUpgrade } =
      await this.findApplicationsToUpgrade({
        applicationRegistrationId,
        onlyAutoUpgrade,
      });

    if (!isDefined(targetVersion)) {
      return [];
    }

    const jobIds = await this.enqueueWorkspaceApplicationUpgrades({
      applicationRegistrationId,
      applications: applicationsToUpgrade,
      onlyAutoUpgrade,
    });

    this.logger.log(
      `Enqueued ${jobIds.length} upgrade job(s) for ${appRegistration.universalIdentifier}, latest available version is ${targetVersion}`,
    );

    return jobIds;
  }

  async upgradeWorkspaceApplicationToLatestVersion({
    applicationRegistrationId,
    workspaceId,
    onlyAutoUpgrade,
  }: {
    applicationRegistrationId: string;
    workspaceId: string;
    onlyAutoUpgrade: boolean;
  }): Promise<void> {
    const appRegistration = await this.appRegistrationRepository.findOne({
      where: { id: applicationRegistrationId },
    });

    if (!isDefined(appRegistration)) {
      this.logger.log(
        `Skipping upgrade for application registration ${applicationRegistrationId} on workspace ${workspaceId}: registration no longer exists`,
      );

      return;
    }

    const targetVersion = appRegistration.latestAvailableVersion;

    if (!isDefined(targetVersion)) {
      this.logger.log(
        `Skipping upgrade of ${appRegistration.universalIdentifier} on workspace ${workspaceId}: no latest available version`,
      );

      return;
    }

    const application = await this.applicationRepository.findOne({
      where: { applicationRegistrationId, workspaceId },
    });

    if (!isDefined(application)) {
      this.logger.log(
        `Skipping upgrade of ${appRegistration.universalIdentifier} on workspace ${workspaceId}: application is not installed anymore`,
      );

      return;
    }

    if (onlyAutoUpgrade && !application.autoUpgrade) {
      this.logger.log(
        `Skipping upgrade of ${appRegistration.universalIdentifier} on workspace ${workspaceId}: auto upgrade is disabled`,
      );

      return;
    }

    if (application.version === targetVersion) {
      this.logger.log(
        `Skipping upgrade of ${appRegistration.universalIdentifier} on workspace ${workspaceId}: already on version ${targetVersion}`,
      );

      return;
    }

    try {
      await this.upgradeApplicationToVersion({
        appRegistration,
        targetVersion,
        workspaceId,
      });
    } catch (error) {
      if (isUpgradeRoleGrantsApprovalError(error)) {
        this.logger.log(
          `Skipping upgrade of ${appRegistration.universalIdentifier} on workspace ${workspaceId}: version ${targetVersion} grants its default role more permissions and needs approval from a workspace admin`,
        );

        return;
      }

      throw error;
    }
  }

  async upgradeApplication(params: {
    appRegistrationId: string;
    targetVersion: string;
    workspaceId: string;
    skipWorkspaceCompatibilityCheck?: boolean;
    hasUserApprovedRoleGrants?: boolean;
  }): Promise<boolean> {
    const appRegistration = await this.appRegistrationRepository.findOneOrFail({
      where: { id: params.appRegistrationId },
    });

    return this.upgradeApplicationToVersion({
      appRegistration,
      targetVersion: params.targetVersion,
      workspaceId: params.workspaceId,
      skipWorkspaceCompatibilityCheck: params.skipWorkspaceCompatibilityCheck,
      hasUserApprovedRoleGrants: params.hasUserApprovedRoleGrants,
    });
  }

  async getRoleGrantsAddedByLatestVersion({
    applicationId,
    workspaceId,
  }: {
    applicationId: string;
    workspaceId: string;
  }): Promise<RoleManifestGrant[]> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId, workspaceId },
      relations: ['applicationRegistration'],
    });

    if (!isDefined(application)) {
      throw new ApplicationException(
        `Application ${applicationId} is not installed in workspace ${workspaceId}`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    const appRegistration = application.applicationRegistration;

    if (
      !isDefined(appRegistration?.manifest) ||
      !isDefined(appRegistration.latestAvailableVersion) ||
      appRegistration.latestAvailableVersion === application.version
    ) {
      return [];
    }

    return this.applicationUpgradeRoleGrantService.getDefaultRoleGrantsAddedByManifest(
      {
        workspaceId,
        applicationId,
        manifest: appRegistration.manifest,
      },
    );
  }

  private async upgradeApplicationToVersion(params: {
    appRegistration: ApplicationRegistrationEntity;
    targetVersion: string;
    workspaceId: string;
    skipWorkspaceCompatibilityCheck?: boolean;
    hasUserApprovedRoleGrants?: boolean;
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
        hasUserApprovedRoleGrants: params.hasUserApprovedRoleGrants,
      });
    } catch (error) {
      const appName =
        appRegistration.sourcePackage ?? appRegistration.universalIdentifier;
      if (!isUpgradeRoleGrantsApprovalError(error)) {
        this.logger.error(`Upgrade failed for ${appName}`, error);
      }

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
