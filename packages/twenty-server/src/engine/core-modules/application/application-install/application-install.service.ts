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
import { SdkClientGenerationService } from 'src/engine/core-modules/sdk-client/sdk-client-generation.service';
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
    private readonly cacheLockService: CacheLockService,
    private readonly sdkClientGenerationService: SdkClientGenerationService,
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

      const { application, wasCreated } = await this.ensureApplicationExists({
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
    universalIdentifier: string;
    name: string;
    workspaceId: string;
    applicationRegistrationId: string;
    sourceType: ApplicationRegistrationSourceType;
  }): Promise<{ application: ApplicationEntity; wasCreated: boolean }> {
    const existing = await this.applicationService.findByUniversalIdentifier({
      universalIdentifier: params.universalIdentifier,
      workspaceId: params.workspaceId,
    });

    if (isDefined(existing)) {
      return { application: existing, wasCreated: false };
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
