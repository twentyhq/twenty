import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { promises as fs } from 'fs';
import { isAbsolute, relative, resolve } from 'path';

import { Manifest } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { buildApplicationFileList } from 'src/engine/core-modules/application/application-install/utils/build-application-file-list.util';
import { ApplicationManifestApplyService } from 'src/engine/core-modules/application/application-manifest/application-manifest-apply.service';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import {
  ApplicationPackageFetcherService,
  type ResolvedPackage,
} from 'src/engine/core-modules/application/application-package/application-package-fetcher.service';
import { ApplicationVersionValidationService } from 'src/engine/core-modules/application/application-package/application-version-validation.service';
import {
  VERSION_PROGRESSION_REASON_TO_INSTALL_EXCEPTION_CODE,
  VERSION_REASON_TO_APPLICATION_EXCEPTION_CODE,
} from 'src/engine/core-modules/application/application-package/constants/version-reason-to-exception-code.constant';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { isImageFilePath } from 'src/engine/core-modules/application/application-registration/utils/is-image-file-path.util';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import {
  LogicFunctionTriggerJob,
  type LogicFunctionTriggerJobData,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class ApplicationInstallService {
  private readonly logger = new Logger(ApplicationInstallService.name);

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly appRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly applicationService: ApplicationService,
    private readonly applicationPackageFetcherService: ApplicationPackageFetcherService,
    private readonly applicationVersionValidationService: ApplicationVersionValidationService,
    private readonly applicationSyncService: ApplicationSyncService,
    private readonly applicationManifestApplyService: ApplicationManifestApplyService,
    private readonly fileStorageService: FileStorageService,
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    private readonly cacheLockService: CacheLockService,
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly metricsService: MetricsService,
  ) {}

  async installApplication(params: {
    appRegistrationId: string;
    version?: string;
    workspaceId: string;
    skipWorkspaceCompatibilityCheck?: boolean;
  }): Promise<boolean> {
    const appRegistration = await this.appRegistrationRepository.findOne({
      where: { id: params.appRegistrationId },
    });

    if (!appRegistration) {
      throw new ApplicationException(
        `Application registration with id ${params.appRegistrationId} not found`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    if (
      appRegistration.sourceType === ApplicationRegistrationSourceType.LOCAL
    ) {
      this.logger.log(
        `Skipping install for LOCAL app ${appRegistration.universalIdentifier} (files synced by CLI watcher in dev mode)`,
      );

      return true;
    }

    if (
      appRegistration.sourceType ===
      ApplicationRegistrationSourceType.OAUTH_ONLY
    ) {
      this.logger.log(
        `Skipping install for OAUTH_ONLY app ${appRegistration.universalIdentifier} (OAuth-only clients have no code artifacts)`,
      );

      return true;
    }

    const lockKey = `app-install:${params.workspaceId}:${appRegistration.universalIdentifier}`;

    return this.cacheLockService.withLock(
      () =>
        this.doInstallApplication(appRegistration, {
          version: params.version,
          workspaceId: params.workspaceId,
          skipWorkspaceCompatibilityCheck:
            params.skipWorkspaceCompatibilityCheck,
        }),
      lockKey,
      { ttl: 60_000, ms: 500, maxRetries: 120 },
    );
  }

  private async doInstallApplication(
    preLockAppRegistration: ApplicationRegistrationEntity,
    params: {
      version?: string;
      workspaceId: string;
      skipWorkspaceCompatibilityCheck?: boolean;
    },
  ): Promise<boolean> {
    // Re-read inside the lock so the authorization below cannot act on stale
    // listing or ownership state.
    const appRegistration = await this.appRegistrationRepository.findOne({
      where: { id: preLockAppRegistration.id },
    });

    if (!appRegistration) {
      throw new ApplicationException(
        `Application registration with id ${preLockAppRegistration.id} not found`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    // Tarball registrations that are neither listed nor pre-installed are
    // only installable by their owner workspace.
    if (
      appRegistration.sourceType ===
        ApplicationRegistrationSourceType.TARBALL &&
      !appRegistration.isListed &&
      !appRegistration.isPreInstalled &&
      appRegistration.ownerWorkspaceId !== params.workspaceId
    ) {
      throw new ApplicationException(
        `Application registration ${appRegistration.universalIdentifier} is not available for this workspace`,
        ApplicationExceptionCode.FORBIDDEN,
      );
    }

    const resolvedPackage =
      await this.applicationPackageFetcherService.resolvePackage(
        appRegistration,
        { targetVersion: params.version },
      );

    if (!resolvedPackage) {
      return true;
    }

    try {
      const existingApplication =
        await this.applicationService.findByUniversalIdentifier({
          universalIdentifier: appRegistration.universalIdentifier,
          workspaceId: params.workspaceId,
        });

      return await this.runInstallWithMetrics({
        appRegistration,
        params,
        resolvedPackage,
        existingApplication,
      });
    } finally {
      await this.applicationPackageFetcherService.cleanupExtractedDir(
        resolvedPackage.cleanupDir,
      );
    }
  }

  private async runInstallWithMetrics({
    appRegistration,
    params,
    resolvedPackage,
    existingApplication,
  }: {
    appRegistration: ApplicationRegistrationEntity;
    params: {
      version?: string;
      workspaceId: string;
      skipWorkspaceCompatibilityCheck?: boolean;
    };
    resolvedPackage: ResolvedPackage;
    existingApplication: ApplicationEntity | null;
  }): Promise<boolean> {
    const isVersionUpgrade = isDefined(existingApplication);

    const attributes = {
      universal_identifier: appRegistration.universalIdentifier,
      app_name: resolvedPackage.manifest.application.displayName,
      source_type: appRegistration.sourceType,
      version: resolvedPackage.packageJson.version ?? 'unknown',
    };

    try {
      const result = await this.runInstall({
        appRegistration,
        params,
        resolvedPackage,
        existingApplication,
      });

      this.metricsService.incrementCounterBy({
        key: isVersionUpgrade
          ? MetricsKeys.AppUpgradeSucceeded
          : MetricsKeys.AppInstallSucceeded,
        amount: 1,
        attributes,
      });

      return result;
    } catch (error) {
      this.metricsService.incrementCounterBy({
        key: isVersionUpgrade
          ? MetricsKeys.AppUpgradeFailed
          : MetricsKeys.AppInstallFailed,
        amount: 1,
        attributes: {
          ...attributes,
          error_code:
            error instanceof ApplicationException ? error.code : 'UNKNOWN',
        },
      });

      throw error;
    }
  }

  private async runInstall({
    appRegistration,
    params,
    resolvedPackage,
    existingApplication,
  }: {
    appRegistration: ApplicationRegistrationEntity;
    params: {
      version?: string;
      workspaceId: string;
      skipWorkspaceCompatibilityCheck?: boolean;
    };
    resolvedPackage: ResolvedPackage;
    existingApplication: ApplicationEntity | null;
  }): Promise<boolean> {
    const universalIdentifier = appRegistration.universalIdentifier;

    if (params.skipWorkspaceCompatibilityCheck !== true) {
      const requiredServerVersion =
        resolvedPackage.packageJson.engines?.['twenty'];

      const versionValidation =
        await this.applicationVersionValidationService.validateWorkspaceCompatibility(
          {
            requiredServerVersion,
            workspaceId: params.workspaceId,
          },
        );

      if (!versionValidation.compatible) {
        throw new ApplicationException(
          versionValidation.message,
          VERSION_REASON_TO_APPLICATION_EXCEPTION_CODE[
            versionValidation.reason
          ],
        );
      }
    }

    const isVersionUpgrade = isDefined(existingApplication);

    const previousVersion = existingApplication?.version ?? undefined;

    const newVersion = resolvedPackage.packageJson.version;

    if (!isDefined(newVersion)) {
      throw new ApplicationException(
        `Package ${universalIdentifier} has no version`,
        ApplicationExceptionCode.PACKAGE_RESOLUTION_FAILED,
      );
    }

    const application = await this.ensureApplicationExists({
      existingApplication,
      universalIdentifier,
      name: resolvedPackage.manifest.application.displayName,
      logo: resolvedPackage.manifest.application.logoUrl ?? null,
      workspaceId: params.workspaceId,
      applicationRegistrationId: appRegistration.id,
      sourceType: appRegistration.sourceType,
    });

    const incomingVersion = resolvedPackage.packageJson.version;

    // Rollback is scoped to the work after the application row exists: reaching
    // this catch means creation succeeded, so a fresh install (not an upgrade)
    // is the only case that needs uninstalling.
    try {
      if (
        isVersionUpgrade &&
        isDefined(application.version) &&
        isDefined(incomingVersion)
      ) {
        const progression =
          this.applicationVersionValidationService.validateVersionProgression({
            incomingVersion,
            currentVersion: application.version,
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

      await this.writeFilesToStorage(
        resolvedPackage.extractedDir,
        resolvedPackage.manifest,
        universalIdentifier,
        params.workspaceId,
      );

      const logoFileId = await this.importLogoFile({
        extractedDir: resolvedPackage.extractedDir,
        manifest: resolvedPackage.manifest,
        applicationUniversalIdentifier: universalIdentifier,
        workspaceId: params.workspaceId,
      });

      if (application.logoFileId !== logoFileId) {
        await this.applicationService.update(application.id, {
          logoFileId: logoFileId ?? null,
          workspaceId: params.workspaceId,
        });
      }

      await this.runPreInstallHook({
        manifest: resolvedPackage.manifest,
        workspaceId: params.workspaceId,
        applicationRegistrationId: appRegistration.id,
        previousVersion,
        newVersion,
        isVersionUpgrade,
        universalIdentifier,
      });

      await this.applicationManifestApplyService.applyManifestToWorkspace({
        workspaceId: params.workspaceId,
        manifest: resolvedPackage.manifest,
        applicationRegistrationId: appRegistration.id,
        application,
      });

      await this.runPostInstallHook({
        manifest: resolvedPackage.manifest,
        workspaceId: params.workspaceId,
        previousVersion,
        newVersion,
        isVersionUpgrade,
        universalIdentifier,
      });

      await this.applicationManifestApplyService.refreshRegistrationFromManifest(
        {
          applicationRegistrationId: appRegistration.id,
          manifest: resolvedPackage.manifest,
          latestAvailableVersion: newVersion,
          preventVersionDowngrade: true,
        },
      );

      this.logger.log(
        `Successfully installed app ${universalIdentifier} v${resolvedPackage.packageJson.version ?? 'unknown'}`,
      );

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to install app ${appRegistration.universalIdentifier}: ${error}`,
      );

      if (!isVersionUpgrade) {
        await this.applicationSyncService.uninstallApplication({
          applicationUniversalIdentifier: universalIdentifier,
          workspaceId: params.workspaceId,
        });
      }

      throw error;
    }
  }

  private async runPreInstallHook(params: {
    manifest: Manifest;
    workspaceId: string;
    applicationRegistrationId?: string;
    previousVersion?: string;
    newVersion: string;
    isVersionUpgrade: boolean;
    universalIdentifier: string;
  }): Promise<void> {
    const {
      manifest,
      workspaceId,
      applicationRegistrationId,
      previousVersion,
      newVersion,
      isVersionUpgrade,
      universalIdentifier,
    } = params;

    if (!isDefined(manifest.application.preInstallLogicFunction)) {
      return;
    }

    await this.applicationSyncService.preInstallSynchronizeFromManifest({
      workspaceId: params.workspaceId,
      manifest,
      applicationRegistrationId,
    });

    const {
      universalIdentifier: preInstallLogicFunctionUniversalIdentifier,
      shouldRunOnVersionUpgrade,
    } = manifest.application.preInstallLogicFunction;

    if (isVersionUpgrade && !shouldRunOnVersionUpgrade) {
      this.logger.log(
        `Skipping pre-install hook for app ${universalIdentifier}: version upgrade and shouldRunOnVersionUpgrade is false`,
      );

      return;
    }

    const { flatLogicFunctionMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatLogicFunctionMaps',
      ]);

    const flatLogicFunction =
      flatLogicFunctionMaps.byUniversalIdentifier[
        preInstallLogicFunctionUniversalIdentifier
      ];

    // preInstallSynchronizeFromManifest should have registered this function
    // moments ago — a miss here means the pared-down sync did not persist the
    // entry, which is a real failure and should abort the install.
    if (!isDefined(flatLogicFunction)) {
      throw new ApplicationException(
        `Pre-install logic function "${preInstallLogicFunctionUniversalIdentifier}" not found for application "${universalIdentifier}" after pre-install sync. The pared-down sync did not register the function as expected.`,
        ApplicationExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    const payload = { previousVersion, newVersion };

    this.logger.log(
      `Executing pre-install hook for app ${universalIdentifier} with payload:`,
      JSON.stringify(payload),
    );

    const result = await this.logicFunctionExecutorService.execute({
      logicFunctionId: flatLogicFunction.id,
      workspaceId,
      payload,
    });

    if (!isDefined(result)) {
      this.logger.log('Pre-install hook executed successfully');
    }

    if (result.error) {
      throw new ApplicationException(
        result.error.errorMessage,
        ApplicationExceptionCode.PRE_INSTALL_ERROR,
      );
    }
  }

  private async runPostInstallHook(params: {
    manifest: Manifest;
    workspaceId: string;
    previousVersion?: string;
    newVersion: string;
    isVersionUpgrade: boolean;
    universalIdentifier: string;
  }): Promise<void> {
    const {
      manifest,
      workspaceId,
      previousVersion,
      newVersion,
      isVersionUpgrade,
      universalIdentifier,
    } = params;

    if (!isDefined(manifest.application.postInstallLogicFunction)) {
      return;
    }

    const {
      universalIdentifier: postInstallLogicFunctionUniversalIdentifier,
      shouldRunOnVersionUpgrade,
      shouldRunSynchronously,
    } = manifest.application.postInstallLogicFunction;

    if (isVersionUpgrade && !shouldRunOnVersionUpgrade) {
      this.logger.log(
        `Skipping post-install hook for app ${universalIdentifier}: version upgrade and shouldRunOnVersionUpgrade is false`,
      );

      return;
    }

    const { flatLogicFunctionMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatLogicFunctionMaps',
      ]);

    const flatLogicFunction =
      flatLogicFunctionMaps.byUniversalIdentifier[
        postInstallLogicFunctionUniversalIdentifier
      ];

    if (!isDefined(flatLogicFunction)) {
      throw new ApplicationException(
        `Post-install logic function "${postInstallLogicFunctionUniversalIdentifier}" not found for application "${universalIdentifier}" after sync. Manifest may reference a stale identifier.`,
        ApplicationExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    const payload = { previousVersion, newVersion };

    this.logger.log(
      `Enqueuing post-install hook for app ${universalIdentifier} with payload:`,
      JSON.stringify(payload),
    );

    if (!shouldRunSynchronously) {
      await this.messageQueueService.add<LogicFunctionTriggerJobData[]>(
        LogicFunctionTriggerJob.name,
        [
          {
            logicFunctionId: flatLogicFunction.id,
            workspaceId,
            payload,
          },
        ],
        { retryLimit: 3 },
      );
      return;
    }

    const result = await this.logicFunctionExecutorService.execute({
      logicFunctionId: flatLogicFunction.id,
      workspaceId,
      payload,
    });

    if (!isDefined(result)) {
      this.logger.log('Post-install hook executed successfully');
    }

    if (result.error) {
      throw new ApplicationException(
        result.error.errorMessage,
        ApplicationExceptionCode.POST_INSTALL_ERROR,
      );
    }
  }

  private resolveWithinDirOrThrow(
    extractedDir: string,
    relativePath: string,
  ): string {
    const absolutePath = resolve(extractedDir, relativePath);
    const relativeToDir = relative(extractedDir, absolutePath);

    if (relativeToDir.startsWith('..') || isAbsolute(relativeToDir)) {
      throw new ApplicationException(
        `Path traversal detected for file: ${relativePath}`,
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }

    return absolutePath;
  }

  private async writeFilesToStorage(
    extractedDir: string,
    manifest: Manifest,
    applicationUniversalIdentifier: string,
    workspaceId: string,
  ): Promise<void> {
    const filesToWrite = buildApplicationFileList(manifest);

    for (const { relativePath, fileFolder, isRequired } of filesToWrite) {
      const absolutePath = this.resolveWithinDirOrThrow(
        extractedDir,
        relativePath,
      );

      let content: Buffer;

      try {
        content = await fs.readFile(absolutePath);
      } catch (error) {
        if (
          !isRequired &&
          error instanceof Error &&
          'code' in error &&
          error.code === 'ENOENT'
        ) {
          this.logger.warn(
            `Source file not found in package: ${relativePath}; skipping for backward compatibility`,
          );

          continue;
        }

        throw new ApplicationException(
          `File not found in package: ${relativePath}`,
          ApplicationExceptionCode.PACKAGE_RESOLUTION_FAILED,
        );
      }

      await this.fileStorageService.writeFile({
        sourceFile: content,
        fileFolder,
        applicationUniversalIdentifier,
        workspaceId,
        resourcePath: relativePath,
        settings: { isTemporaryFile: false, toDelete: false },
      });
    }
  }

  private async importLogoFile({
    extractedDir,
    manifest,
    applicationUniversalIdentifier,
    workspaceId,
  }: {
    extractedDir: string;
    manifest: Manifest;
    applicationUniversalIdentifier: string;
    workspaceId: string;
  }): Promise<string | null> {
    const logo = manifest.application.logo ?? manifest.application.logoUrl;

    if (
      !isDefined(logo) ||
      logo.startsWith('http://') ||
      logo.startsWith('https://')
    ) {
      return null;
    }

    if (!isImageFilePath(logo)) {
      this.logger.warn(
        `Logo "${logo}" is not a supported image type; skipping logo import for ${applicationUniversalIdentifier}`,
      );

      return null;
    }

    const absolutePath = this.resolveWithinDirOrThrow(extractedDir, logo);

    let content: Buffer;

    try {
      content = await fs.readFile(absolutePath);
    } catch {
      this.logger.warn(
        `Logo "${logo}" declared in manifest but not found in package for ${applicationUniversalIdentifier}; skipping logo import`,
      );

      return null;
    }

    const file = await this.fileStorageService.writeFile({
      sourceFile: content,
      fileFolder: FileFolder.PublicAsset,
      applicationUniversalIdentifier,
      workspaceId,
      resourcePath: logo,
      settings: { isTemporaryFile: false, toDelete: false },
    });

    return file.id;
  }

  private async ensureApplicationExists(params: {
    existingApplication: ApplicationEntity | null;
    universalIdentifier: string;
    name: string;
    logo: string | null;
    workspaceId: string;
    applicationRegistrationId: string;
    sourceType: ApplicationRegistrationSourceType;
  }): Promise<ApplicationEntity> {
    if (isDefined(params.existingApplication)) {
      return params.existingApplication;
    }

    return await this.applicationService.create({
      universalIdentifier: params.universalIdentifier,
      name: params.name,
      logo: params.logo,
      sourcePath: params.universalIdentifier,
      sourceType: params.sourceType,
      applicationRegistrationId: params.applicationRegistrationId,
      workspaceId: params.workspaceId,
    });
  }
}
