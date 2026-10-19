import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import chunk from 'lodash.chunk';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { ApplicationVersionValidationService } from 'src/engine/core-modules/application/application-package/application-version-validation.service';
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
import { countInstallsFittingBudget } from 'src/engine/core-modules/application/application-install/utils/count-installs-fitting-budget.util';
import { ApplicationManagementBudgetService } from 'src/engine/core-modules/application/application-install/services/application-management-budget.service';
import { APPLICATION_AUTO_UPGRADE_CRON_MAX_CANDIDATE_COUNT } from 'src/engine/core-modules/application/application-upgrade/constants/application-auto-upgrade-cron-max-candidate-count.constant';
import { INCOMPATIBLE_UPGRADE_RETRY_DELAY_MS } from 'src/engine/core-modules/application/application-upgrade/constants/incompatible-upgrade-retry-delay-ms.constant';
import { FAILED_UPGRADE_RETRY_DELAY_MS } from 'src/engine/core-modules/application/application-upgrade/constants/failed-upgrade-retry-delay-ms.constant';
import { buildBlockedUpgradeCacheKey } from 'src/engine/core-modules/application/application-upgrade/utils/build-blocked-upgrade-cache-key.util';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { type LogicFunctionAvailableManagementBudget } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { type MessageQueueJobProgressContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceVersionService } from 'src/engine/workspace-manager/workspace-version/services/workspace-version.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class ApplicationUpgradeService {
  private readonly logger = new Logger(ApplicationUpgradeService.name);

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly appRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    @InjectWorkspaceScopedRepository(ApplicationEntity)
    private readonly applicationRepository: WorkspaceScopedRepository<ApplicationEntity>,
    // Picking the rollout targets spans workspaces: the query filters by
    // registration, with an explicit workspace id list only when one is given.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(ApplicationEntity)
    private readonly unscopedApplicationRepository: Repository<ApplicationEntity>,
    private readonly applicationInstallService: ApplicationInstallService,
    private readonly applicationVersionValidationService: ApplicationVersionValidationService,
    private readonly workspaceVersionService: WorkspaceVersionService,
    @InjectMessageQueue(MessageQueue.applicationUpgradeQueue)
    private readonly applicationUpgradeQueueService: MessageQueueService,
    private readonly applicationManagementBudgetService: ApplicationManagementBudgetService,
    @InjectCacheStorage(CacheStorageNamespace.ModuleApplications)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async findApplicationsToUpgrade({
    applicationRegistrationId,
    onlyAutoUpgrade = false,
    workspaceIds,
    workspaceCountLimit,
    skipRecentlyBlockedUpgrades = false,
    maxCandidateCount,
  }: {
    applicationRegistrationId: string;
    onlyAutoUpgrade?: boolean;
    workspaceIds?: string[];
    workspaceCountLimit?: number;
    skipRecentlyBlockedUpgrades?: boolean;
    maxCandidateCount?: number;
  }): Promise<{
    appRegistration: ApplicationRegistrationEntity;
    targetVersion: string | null;
    applicationsToUpgrade: ApplicationEntity[];
    skippedNonProvisionedWorkspaceIds: string[];
    skippedIncompatibleWorkspaceIds: string[];
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
        skippedIncompatibleWorkspaceIds: [],
      };
    }

    const applications = await this.unscopedApplicationRepository.find({
      where: {
        applicationRegistrationId,
        ...(onlyAutoUpgrade ? { autoUpgrade: true } : {}),
        ...(isNonEmptyArray(workspaceIds)
          ? { workspaceId: In(workspaceIds) }
          : {}),
      },
    });

    const outdatedApplicationsIncludingSkipped = applications.filter(
      (application) => application.version !== targetVersion,
    );

    const workspaceIdsToSkip = await this.findWorkspaceIdsToSkipForUpgrade({
      applicationRegistrationId,
      targetVersion,
      workspaceIds: outdatedApplicationsIncludingSkipped.map(
        (application) => application.workspaceId,
      ),
      skipRecentlyBlockedUpgrades,
    });

    const outdatedApplications = outdatedApplicationsIncludingSkipped.filter(
      (application) => !workspaceIdsToSkip.has(application.workspaceId),
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

    const requiredServerVersion =
      appRegistration.manifest?.application.requiredServerVersionRange ??
      undefined;

    const compatibleApplications: ApplicationEntity[] = [];
    const skippedIncompatibleWorkspaceIds: string[] = [];

    const candidateApplications = isDefined(maxCandidateCount)
      ? provisionedApplications.slice(0, maxCandidateCount)
      : provisionedApplications;

    for (const application of candidateApplications) {
      const validation =
        await this.applicationVersionValidationService.validateWorkspaceCompatibility(
          { requiredServerVersion, workspaceId: application.workspaceId },
        );

      if (
        !validation.compatible &&
        validation.reason === 'WORKSPACE_INCOMPATIBLE'
      ) {
        skippedIncompatibleWorkspaceIds.push(application.workspaceId);
        continue;
      }

      compatibleApplications.push(application);
    }

    if (skipRecentlyBlockedUpgrades) {
      await this.cacheStorageService.mset(
        skippedIncompatibleWorkspaceIds.map((workspaceId) => ({
          key: buildBlockedUpgradeCacheKey({
            applicationRegistrationId,
            workspaceId,
          }),
          value: targetVersion,
          ttl: INCOMPATIBLE_UPGRADE_RETRY_DELAY_MS,
        })),
      );
    }

    const applicationsToUpgrade = isDefined(workspaceCountLimit)
      ? compatibleApplications.slice(0, workspaceCountLimit)
      : compatibleApplications;

    return {
      appRegistration,
      targetVersion,
      applicationsToUpgrade,
      skippedNonProvisionedWorkspaceIds,
      skippedIncompatibleWorkspaceIds,
    };
  }

  private async findWorkspaceIdsToSkipForUpgrade({
    applicationRegistrationId,
    targetVersion,
    workspaceIds,
    skipRecentlyBlockedUpgrades,
  }: {
    applicationRegistrationId: string;
    targetVersion: string;
    workspaceIds: string[];
    skipRecentlyBlockedUpgrades: boolean;
  }): Promise<Set<string>> {
    const inFlightUpgrades =
      await this.applicationUpgradeQueueService.getInFlightJobs<UpgradeWorkspaceApplicationJobData>();

    const workspaceIdsToSkip = new Set(
      inFlightUpgrades
        .filter(
          ({ data }) =>
            data.applicationRegistrationId === applicationRegistrationId,
        )
        .map(({ data }) => data.workspaceId),
    );

    if (!skipRecentlyBlockedUpgrades || workspaceIds.length === 0) {
      return workspaceIdsToSkip;
    }

    const blockedVersions = await this.cacheStorageService.mget<string>(
      workspaceIds.map((workspaceId) =>
        buildBlockedUpgradeCacheKey({ applicationRegistrationId, workspaceId }),
      ),
    );

    workspaceIds.forEach((workspaceId, index) => {
      if (blockedVersions[index] === targetVersion) {
        workspaceIdsToSkip.add(workspaceId);
      }
    });

    return workspaceIdsToSkip;
  }

  async enqueueWorkspaceApplicationUpgrades({
    appRegistration,
    applications,
    onlyAutoUpgrade,
    availableBudget,
  }: {
    appRegistration: Pick<ApplicationRegistrationEntity, 'id' | 'manifest'>;
    applications: ApplicationEntity[];
    onlyAutoUpgrade: boolean;
    availableBudget?: LogicFunctionAvailableManagementBudget;
  }): Promise<{ jobIds: string[]; enqueuedFunctionCount: number }> {
    if (!isNonEmptyArray(applications)) {
      return { jobIds: [], enqueuedFunctionCount: 0 };
    }

    const { installCount, functionCount } = countInstallsFittingBudget({
      manifest: appRegistration.manifest,
      isVersionUpgrade: true,
      workspaceCount: applications.length,
      availableBudget:
        availableBudget ??
        (await this.applicationManagementBudgetService.getAvailableBudget()),
    });

    const jobIds: string[] = [];

    for (const applicationsBatch of chunk(
      applications.slice(0, installCount),
      UPGRADE_WORKSPACE_APPLICATION_JOB_ENQUEUE_BATCH_SIZE,
    )) {
      const batchJobIds =
        await this.applicationUpgradeQueueService.bulkAdd<UpgradeWorkspaceApplicationJobData>(
          UPGRADE_WORKSPACE_APPLICATION_JOB_NAME,
          applicationsBatch.map((application) => ({
            data: {
              applicationRegistrationId: appRegistration.id,
              workspaceId: application.workspaceId,
              onlyAutoUpgrade,
            },
          })),
          UPGRADE_WORKSPACE_APPLICATION_JOB_OPTIONS,
        );

      jobIds.push(...batchJobIds);
    }

    return { jobIds, enqueuedFunctionCount: functionCount };
  }

  async enqueuePendingAutoUpgrades(): Promise<void> {
    const pendingRegistrations: { applicationRegistrationId: string }[] =
      await this.unscopedApplicationRepository
        .createQueryBuilder('application')
        .innerJoin(
          ApplicationRegistrationEntity,
          'registration',
          'registration.id = application.applicationRegistrationId',
        )
        .select(
          'application.applicationRegistrationId',
          'applicationRegistrationId',
        )
        .distinct(true)
        .where('application.autoUpgrade = true')
        .andWhere('registration.latestAvailableVersion IS NOT NULL')
        .andWhere(
          'application.version IS DISTINCT FROM registration.latestAvailableVersion',
        )
        .getRawMany();

    const { availableFunctionCount, maxFunctionCount } =
      await this.applicationManagementBudgetService.getAvailableBudget();

    let remainingFunctionCount = availableFunctionCount;

    for (const { applicationRegistrationId } of pendingRegistrations) {
      if (remainingFunctionCount <= 0) {
        return;
      }

      try {
        const { enqueuedFunctionCount } = await this.enqueueApplicationUpgrades(
          {
            applicationRegistrationId,
            onlyAutoUpgrade: true,
            skipRecentlyBlockedUpgrades: true,
            maxCandidateCount:
              APPLICATION_AUTO_UPGRADE_CRON_MAX_CANDIDATE_COUNT,
            availableBudget: {
              availableFunctionCount: remainingFunctionCount,
              maxFunctionCount,
            },
          },
        );

        remainingFunctionCount -= enqueuedFunctionCount;
      } catch (error) {
        this.logger.error(
          `Failed to enqueue pending auto-upgrades for registration ${applicationRegistrationId}`,
          error,
        );
      }
    }
  }

  async enqueueApplicationUpgrades({
    applicationRegistrationId,
    onlyAutoUpgrade = false,
    skipRecentlyBlockedUpgrades = false,
    maxCandidateCount,
    availableBudget,
  }: {
    applicationRegistrationId: string;
    onlyAutoUpgrade?: boolean;
    skipRecentlyBlockedUpgrades?: boolean;
    maxCandidateCount?: number;
    availableBudget?: LogicFunctionAvailableManagementBudget;
  }): Promise<{ jobIds: string[]; enqueuedFunctionCount: number }> {
    const {
      appRegistration,
      targetVersion,
      applicationsToUpgrade,
      skippedIncompatibleWorkspaceIds,
    } = await this.findApplicationsToUpgrade({
      applicationRegistrationId,
      onlyAutoUpgrade,
      skipRecentlyBlockedUpgrades,
      maxCandidateCount,
    });

    if (!isDefined(targetVersion)) {
      return { jobIds: [], enqueuedFunctionCount: 0 };
    }

    if (skippedIncompatibleWorkspaceIds.length > 0) {
      this.logger.log(
        `Skipping ${skippedIncompatibleWorkspaceIds.length} workspace(s) that have not finished the server upgrade ${appRegistration.universalIdentifier}@${targetVersion} requires`,
      );
    }

    const { jobIds, enqueuedFunctionCount } =
      await this.enqueueWorkspaceApplicationUpgrades({
        appRegistration,
        applications: applicationsToUpgrade,
        onlyAutoUpgrade,
        availableBudget,
      });

    this.logger.log(
      `Enqueued ${jobIds.length} upgrade job(s) for ${appRegistration.universalIdentifier}, latest available version is ${targetVersion}`,
    );

    return { jobIds, enqueuedFunctionCount };
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

    const application = await this.applicationRepository.findOne(workspaceId, {
      where: { applicationRegistrationId },
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
      await this.cacheStorageService.set(
        buildBlockedUpgradeCacheKey({
          applicationRegistrationId,
          workspaceId,
        }),
        targetVersion,
        FAILED_UPGRADE_RETRY_DELAY_MS,
      );

      throw error;
    }
  }

  async upgradeApplication(params: {
    appRegistrationId: string;
    targetVersion: string;
    workspaceId: string;
    skipWorkspaceCompatibilityCheck?: boolean;
    updateProgress?: MessageQueueJobProgressContext['updateProgress'];
  }): Promise<boolean> {
    const appRegistration = await this.appRegistrationRepository.findOneOrFail({
      where: { id: params.appRegistrationId },
    });

    return this.upgradeApplicationToVersion({
      appRegistration,
      targetVersion: params.targetVersion,
      workspaceId: params.workspaceId,
      skipWorkspaceCompatibilityCheck: params.skipWorkspaceCompatibilityCheck,
      updateProgress: params.updateProgress,
    });
  }

  private async upgradeApplicationToVersion(params: {
    appRegistration: ApplicationRegistrationEntity;
    targetVersion: string;
    workspaceId: string;
    skipWorkspaceCompatibilityCheck?: boolean;
    updateProgress?: MessageQueueJobProgressContext['updateProgress'];
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
        updateProgress: params.updateProgress,
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
