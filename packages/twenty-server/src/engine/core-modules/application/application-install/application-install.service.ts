import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { promises as fs } from 'fs';
import { resolve } from 'path';

import semver from 'semver';
import { Manifest } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import {
  ApplicationPackageFetcherService,
  type ResolvedPackage,
} from 'src/engine/core-modules/application/application-package/application-package-fetcher.service';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import {
  LogicFunctionTriggerJob,
  type LogicFunctionTriggerJobData,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { SdkClientGenerationService } from 'src/engine/core-modules/sdk-client/sdk-client-generation.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';

@Injectable()
export class ApplicationInstallService {
  private readonly logger = new Logger(ApplicationInstallService.name);

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly appRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly applicationService: ApplicationService,
    private readonly applicationPackageFetcherService: ApplicationPackageFetcherService,
    private readonly applicationSyncService: ApplicationSyncService,
    private readonly fileStorageService: FileStorageService,
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    private readonly cacheLockService: CacheLockService,
    private readonly sdkClientGenerationService: SdkClientGenerationService,
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async installApplication(params: {
    appRegistrationId: string;
    version?: string;
    workspaceId: string;
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
        }),
      lockKey,
      { ttl: 60_000, ms: 500, maxRetries: 120 },
    );
  }

  private async doInstallApplication(
    appRegistration: ApplicationRegistrationEntity,
    params: { version?: string; workspaceId: string },
  ): Promise<boolean> {
    let resolvedPackage: ResolvedPackage | null = null;

    try {
      resolvedPackage =
        await this.applicationPackageFetcherService.resolvePackage(
          appRegistration,
          { targetVersion: params.version },
        );

      if (!resolvedPackage) {
        return true;
      }

      const universalIdentifier = appRegistration.universalIdentifier;

      const existingApplication =
        await this.applicationService.findByUniversalIdentifier({
          universalIdentifier,
          workspaceId: params.workspaceId,
        });

      const previousVersion = existingApplication?.version ?? undefined;

      const newVersion = resolvedPackage.packageJson.version;

      if (!isDefined(newVersion)) {
        throw new ApplicationException(
          `Package ${universalIdentifier} has no version`,
          ApplicationExceptionCode.PACKAGE_RESOLUTION_FAILED,
        );
      }

      const isVersionUpgrade = isDefined(existingApplication);

      const { application, wasCreated } = await this.ensureApplicationExists({
        existingApplication,
        universalIdentifier,
        name: resolvedPackage.manifest.application.displayName,
        workspaceId: params.workspaceId,
        applicationRegistrationId: appRegistration.id,
        sourceType: appRegistration.sourceType,
      });

      const incomingVersion = resolvedPackage.packageJson.version;

      if (
        !wasCreated &&
        isDefined(application.version) &&
        isDefined(incomingVersion)
      ) {
        if (!isDefined(semver.valid(incomingVersion))) {
          throw new ApplicationException(
            `Invalid version "${incomingVersion}" in package.json. Must be a valid semver version.`,
            ApplicationExceptionCode.INVALID_INPUT,
          );
        }

        if (isDefined(semver.valid(application.version))) {
          if (semver.eq(incomingVersion, application.version)) {
            throw new ApplicationException(
              `${universalIdentifier}@${incomingVersion} is already installed in this workspace.`,
              ApplicationExceptionCode.APP_ALREADY_INSTALLED,
            );
          }

          if (semver.lt(incomingVersion, application.version)) {
            throw new ApplicationException(
              `Cannot install ${universalIdentifier}@${incomingVersion}: version ${application.version} is already installed and downgrading is not allowed.`,
              ApplicationExceptionCode.CANNOT_DOWNGRADE_APPLICATION,
            );
          }
        }
      }

      await this.writeFilesToStorage(
        resolvedPackage.extractedDir,
        resolvedPackage.manifest,
        universalIdentifier,
        params.workspaceId,
      );

      await this.runPreInstallHook({
        manifest: resolvedPackage.manifest,
        workspaceId: params.workspaceId,
        applicationRegistrationId: appRegistration.id,
        previousVersion,
        newVersion,
        isVersionUpgrade,
        universalIdentifier,
      });

      const { hasSchemaMetadataChanged } =
        await this.applicationSyncService.synchronizeFromManifest({
          workspaceId: params.workspaceId,
          manifest: resolvedPackage.manifest,
          applicationRegistrationId: appRegistration.id,
        });

      if (wasCreated || hasSchemaMetadataChanged) {
        await this.sdkClientGenerationService.generateSdkClientForApplication({
          workspaceId: params.workspaceId,
          applicationId: application.id,
          applicationUniversalIdentifier: universalIdentifier,
        });
      }

      await this.runPostInstallHook({
        manifest: resolvedPackage.manifest,
        workspaceId: params.workspaceId,
        previousVersion,
        newVersion,
        isVersionUpgrade,
        universalIdentifier,
      });

      this.logger.log(
        `Successfully installed app ${universalIdentifier} v${resolvedPackage.packageJson.version ?? 'unknown'}`,
      );

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to install app ${appRegistration.universalIdentifier}: ${error}`,
      );

      throw error;
    } finally {
      if (resolvedPackage) {
        await this.applicationPackageFetcherService.cleanupExtractedDir(
          resolvedPackage.cleanupDir,
        );
      }
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

  private async writeFilesToStorage(
    extractedDir: string,
    manifest: Manifest,
    applicationUniversalIdentifier: string,
    workspaceId: string,
  ): Promise<void> {
    const filesToWrite = this.buildFileList(manifest);

    for (const { relativePath, fileFolder } of filesToWrite) {
      const absolutePath = resolve(extractedDir, relativePath);

      if (!absolutePath.startsWith(extractedDir)) {
        throw new ApplicationException(
          `Path traversal detected for file: ${relativePath}`,
          ApplicationExceptionCode.INVALID_INPUT,
        );
      }

      let content: Buffer;

      try {
        content = await fs.readFile(absolutePath);
      } catch {
        throw new ApplicationException(
          `File not found in package: ${relativePath}`,
          ApplicationExceptionCode.PACKAGE_RESOLUTION_FAILED,
        );
      }

      // TODO: mimeType should be defined, default to application/octet-stream, which won't be displayed
      // inline by the browser (forced download) due to Content-Disposition security headers.
      await this.fileStorageService.writeFile({
        sourceFile: content,
        mimeType: undefined,
        fileFolder,
        applicationUniversalIdentifier,
        workspaceId,
        resourcePath: relativePath,
        settings: { isTemporaryFile: false, toDelete: false },
      });
    }
  }

  private buildFileList(
    manifest: Manifest,
  ): Array<{ relativePath: string; fileFolder: FileFolder }> {
    const files: Array<{ relativePath: string; fileFolder: FileFolder }> = [];

    files.push(
      { relativePath: 'package.json', fileFolder: FileFolder.Dependencies },
      { relativePath: 'manifest.json', fileFolder: FileFolder.Source },
    );

    for (const logicFunction of manifest.logicFunctions ?? []) {
      files.push({
        relativePath: logicFunction.builtHandlerPath,
        fileFolder: FileFolder.BuiltLogicFunction,
      });
    }

    for (const frontComponent of manifest.frontComponents ?? []) {
      files.push({
        relativePath: frontComponent.builtComponentPath,
        fileFolder: FileFolder.BuiltFrontComponent,
      });
    }

    for (const publicAsset of manifest.publicAssets ?? []) {
      files.push({
        relativePath: publicAsset.filePath,
        fileFolder: FileFolder.PublicAsset,
      });
    }

    return files;
  }

  private async ensureApplicationExists(params: {
    existingApplication: ApplicationEntity | null;
    universalIdentifier: string;
    name: string;
    workspaceId: string;
    applicationRegistrationId: string;
    sourceType: ApplicationRegistrationSourceType;
  }): Promise<{ application: ApplicationEntity; wasCreated: boolean }> {
    if (isDefined(params.existingApplication)) {
      return { application: params.existingApplication, wasCreated: false };
    }

    const application = await this.applicationService.create({
      universalIdentifier: params.universalIdentifier,
      name: params.name,
      sourcePath: params.universalIdentifier,
      sourceType: params.sourceType,
      applicationRegistrationId: params.applicationRegistrationId,
      workspaceId: params.workspaceId,
    });

    return { application, wasCreated: true };
  }
}
