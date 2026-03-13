import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { promises as fs } from 'fs';
import { join, relative } from 'path';

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
import { SdkClientGenerationService } from 'src/engine/core-modules/logic-function/logic-function-resource/sdk-client-generation.service';

const FILE_FOLDER_MAPPING: Record<string, FileFolder> = {
  'package.json': FileFolder.Dependencies,
  'yarn.lock': FileFolder.Dependencies,
};

const FILE_FOLDER_PATTERN_MAPPING: Array<{
  pattern: RegExp;
  folder: FileFolder;
}> = [
  { pattern: /\.function\.mjs$/, folder: FileFolder.BuiltLogicFunction },
  {
    pattern: /\.front-component\.mjs$/,
    folder: FileFolder.BuiltFrontComponent,
  },
  { pattern: /^public\//, folder: FileFolder.PublicAsset },
];

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

      await this.writeFilesToStorage(
        resolvedPackage.extractedDir,
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
        await this.sdkClientGenerationService.generateApplicationClient({
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
    applicationUniversalIdentifier: string,
    workspaceId: string,
  ): Promise<void> {
    const files = await this.collectFiles(extractedDir);

    for (const filePath of files) {
      const relativePath = relative(extractedDir, filePath);
      const fileFolder = this.resolveFileFolder(relativePath);
      const content = await fs.readFile(filePath);

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

  private resolveFileFolder(relativePath: string): FileFolder {
    const exact = FILE_FOLDER_MAPPING[relativePath];

    if (isDefined(exact)) {
      return exact;
    }

    for (const { pattern, folder } of FILE_FOLDER_PATTERN_MAPPING) {
      if (pattern.test(relativePath)) {
        return folder;
      }
    }

    return FileFolder.Source;
  }

  private async collectFiles(dir: string): Promise<string[]> {
    const result: string[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.name === 'node_modules' || entry.name === '.yarn') {
        continue;
      }

      if (entry.isSymbolicLink()) {
        continue;
      }

      if (entry.isDirectory()) {
        const subFiles = await this.collectFiles(fullPath);

        result.push(...subFiles);
      } else {
        result.push(fullPath);
      }
    }

    return result;
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
