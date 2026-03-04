import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { promises as fs } from 'fs';
import { join, relative } from 'path';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { DataSource, Repository } from 'typeorm';

import {
  ApplicationRegistrationEntity,
  AppRegistrationSourceType,
} from 'src/engine/core-modules/application-registration/application-registration.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  AppPackageResolverService,
  type ResolvedPackage,
} from 'src/engine/core-modules/application/services/app-package-resolver.service';
import { ApplicationSyncService } from 'src/engine/core-modules/application/services/application-sync.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';

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
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly appPackageResolverService: AppPackageResolverService,
    private readonly applicationSyncService: ApplicationSyncService,
    private readonly fileStorageService: FileStorageService,
    private readonly dataSource: DataSource,
  ) {}

  async installApplication(params: {
    appRegistrationId: string;
    version?: string;
    workspaceId: string;
  }): Promise<boolean> {
    const appRegistration = await this.appRegistrationRepository.findOneOrFail({
      where: { id: params.appRegistrationId },
    });

    if (appRegistration.sourceType === AppRegistrationSourceType.LOCAL) {
      this.logger.log(
        `App ${appRegistration.universalIdentifier} has no source code to install (OAuth-only)`,
      );

      return true;
    }

    const [lockKey1, lockKey2] = this.computeLockKeys(
      params.workspaceId,
      appRegistration.universalIdentifier,
    );

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    let resolvedPackage: ResolvedPackage | null = null;

    try {
      await queryRunner.query(`SELECT pg_advisory_xact_lock($1, $2)`, [
        lockKey1,
        lockKey2,
      ]);

      resolvedPackage = await this.appPackageResolverService.resolvePackage(
        appRegistration,
        { targetVersion: params.version },
      );

      if (!resolvedPackage) {
        await queryRunner.commitTransaction();

        return true;
      }

      await this.writeFilesToStorage(
        resolvedPackage.extractedDir,
        appRegistration.universalIdentifier,
        params.workspaceId,
      );

      await this.updateApplicationSourceType(
        appRegistration.universalIdentifier,
        params.workspaceId,
        appRegistration.sourceType,
      );

      await this.applicationSyncService.synchronizeFromManifest({
        workspaceId: params.workspaceId,
        manifest: resolvedPackage.manifest,
      });

      await queryRunner.commitTransaction();

      this.logger.log(
        `Successfully installed app ${appRegistration.universalIdentifier} v${resolvedPackage.packageJson.version ?? 'unknown'}`,
      );

      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.logger.error(
        `Failed to install app ${appRegistration.universalIdentifier}: ${error}`,
      );

      throw error;
    } finally {
      await queryRunner.release();

      if (resolvedPackage) {
        await this.appPackageResolverService.cleanupExtractedDir(
          resolvedPackage.extractedDir,
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
      const storagePath = join(
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder,
      );

      await this.fileStorageService.writeFileLegacy({
        file: content,
        name: relativePath,
        folder: storagePath,
        mimeType: undefined,
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

  private async updateApplicationSourceType(
    universalIdentifier: string,
    workspaceId: string,
    sourceType: AppRegistrationSourceType,
  ): Promise<void> {
    await this.applicationRepository.update(
      { universalIdentifier, workspaceId },
      { sourceType },
    );
  }

  private computeLockKeys(
    workspaceId: string,
    universalIdentifier: string,
  ): [number, number] {
    return [this.hashString(workspaceId), this.hashString(universalIdentifier)];
  }

  private hashString(input: string): number {
    let hash = 0;

    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);

      hash = (hash << 5) - hash + char;
      hash |= 0;
    }

    return hash;
  }

  validateSourceChannel(
    appRegistration: ApplicationRegistrationEntity,
    requestedChannel: 'npm' | 'tarball',
  ): void {
    if (
      appRegistration.sourceType !== AppRegistrationSourceType.LOCAL &&
      appRegistration.sourceType !== requestedChannel
    ) {
      throw new ApplicationException(
        `This app is registered as ${appRegistration.sourceType}. Cannot use ${requestedChannel} channel.`,
        ApplicationExceptionCode.SOURCE_CHANNEL_MISMATCH,
      );
    }
  }
}
