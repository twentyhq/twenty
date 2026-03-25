import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { execFile } from 'child_process';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { promisify } from 'util';

import { type Manifest } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type PackageJson } from 'type-fest';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { YARN_ENGINE_DIRNAME } from 'src/engine/core-modules/application/application-package/constants/yarn-engine-dirname';
import { assertValidNpmPackageName } from 'src/engine/core-modules/application/application-package/utils/assert-valid-npm-package-name.util';
import { extractTarballSecurely } from 'src/engine/core-modules/application/application-package/utils/extract-tarball-securely.util';
import { readJsonFileOrThrow } from 'src/engine/core-modules/application/application-package/utils/read-json-file.util';
import { resolvePackageContentDir } from 'src/engine/core-modules/application/application-package/utils/tarball-utils';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

const execFilePromise = promisify(execFile);

const APP_FETCHER_TMPDIR = join(tmpdir(), 'twenty-app-fetcher');
const RESOLUTION_TIMEOUT_MS = 30_000;

export type ResolvedPackage = {
  extractedDir: string;
  cleanupDir: string;
  manifest: Manifest;
  packageJson: PackageJson;
};

@Injectable()
export class ApplicationPackageFetcherService implements OnModuleInit {
  private readonly logger = new Logger(ApplicationPackageFetcherService.name);

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly fileStorageService: FileStorageService,
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await fs.rm(APP_FETCHER_TMPDIR, { recursive: true, force: true });
    } catch {
      // best-effort cleanup of stale temp files from previous runs
    }
  }

  async resolveNpmPackage(
    packageName: string,
    targetVersion?: string,
  ): Promise<ResolvedPackage> {
    return this.resolveFromNpm(packageName, targetVersion);
  }

  async resolvePackage(
    appRegistration: ApplicationRegistrationEntity,
    options?: { targetVersion?: string },
  ): Promise<ResolvedPackage | null> {
    switch (appRegistration.sourceType) {
      case ApplicationRegistrationSourceType.NPM:
        if (!appRegistration.sourcePackage) {
          throw new ApplicationException(
            `App registration ${appRegistration.id} has sourceType=npm but no sourcePackage`,
            ApplicationExceptionCode.PACKAGE_RESOLUTION_FAILED,
          );
        }

        return this.resolveFromNpm(
          appRegistration.sourcePackage,
          options?.targetVersion,
        );
      case ApplicationRegistrationSourceType.TARBALL:
        return this.resolveFromTarball(appRegistration);
      case ApplicationRegistrationSourceType.LOCAL:
      case ApplicationRegistrationSourceType.OAUTH_ONLY:
        return null;
    }
  }

  async cleanupExtractedDir(extractedDir: string): Promise<void> {
    try {
      await fs.rm(extractedDir, { recursive: true, force: true });
    } catch (error) {
      this.logger.warn(`Failed to clean up ${extractedDir}: ${error}`);
    }
  }

  private async resolveFromNpm(
    packageName: string,
    targetVersion?: string,
  ): Promise<ResolvedPackage> {
    const workDir = join(APP_FETCHER_TMPDIR, v4());

    await fs.mkdir(workDir, { recursive: true });

    try {
      const registryUrl = this.twentyConfigService.get('APP_REGISTRY_URL');

      const authToken = this.twentyConfigService.get('APP_REGISTRY_TOKEN');

      assertValidNpmPackageName(packageName);

      const versionSpec = targetVersion ?? 'latest';

      await this.writeNpmrc({
        workDir,
        packageName,
        registryUrl,
        authToken,
      });
      await this.setupYarnEngine(workDir);
      await this.writeMinimalPackageJson(workDir, packageName, versionSpec);
      await this.runYarnInstall(workDir);

      const packageDir = join(workDir, 'node_modules', packageName);
      const manifest = await readJsonFileOrThrow<Manifest>(
        packageDir,
        'manifest.json',
      );
      const packageJson = await readJsonFileOrThrow<PackageJson>(
        packageDir,
        'package.json',
      );

      return {
        extractedDir: packageDir,
        cleanupDir: workDir,
        manifest,
        packageJson,
      };
    } catch (error) {
      await this.cleanupExtractedDir(workDir);
      throw new ApplicationException(
        `Failed to resolve npm package ${packageName}: ${error}`,
        ApplicationExceptionCode.PACKAGE_RESOLUTION_FAILED,
      );
    }
  }

  private async resolveFromTarball(
    appRegistration: ApplicationRegistrationEntity,
  ): Promise<ResolvedPackage> {
    if (!isDefined(appRegistration.tarballFileId)) {
      throw new ApplicationException(
        `App registration ${appRegistration.id} has sourceType=tarball but no tarball file`,
        ApplicationExceptionCode.TARBALL_EXTRACTION_FAILED,
      );
    }

    const workDir = join(APP_FETCHER_TMPDIR, v4());

    await fs.mkdir(workDir, { recursive: true });

    try {
      const file = await this.fileRepository.findOneOrFail({
        where: { id: appRegistration.tarballFileId },
      });

      const application = await this.applicationRepository.findOneOrFail({
        where: { id: file.applicationId },
      });

      const tarballStream = await this.fileStorageService.readFile({
        workspaceId: file.workspaceId,
        applicationUniversalIdentifier: application.universalIdentifier,
        fileFolder: FileFolder.AppTarball,
        resourcePath: removeFileFolderFromFileEntityPath(file.path),
      });

      const tarballBuffer = await streamToBuffer(tarballStream);
      const tarballPath = join(workDir, 'app.tar.gz');

      await fs.writeFile(tarballPath, tarballBuffer);
      await extractTarballSecurely(tarballPath, workDir);
      await fs.rm(tarballPath);

      const contentDir = await resolvePackageContentDir(workDir);
      const manifest = await readJsonFileOrThrow<Manifest>(
        contentDir,
        'manifest.json',
      );
      const packageJson = await readJsonFileOrThrow<PackageJson>(
        contentDir,
        'package.json',
      );

      return {
        extractedDir: contentDir,
        cleanupDir: workDir,
        manifest,
        packageJson,
      };
    } catch (error) {
      await this.cleanupExtractedDir(workDir);

      if (error instanceof ApplicationException) {
        throw error;
      }

      throw new ApplicationException(
        `Failed to resolve tarball for app ${appRegistration.universalIdentifier}: ${error}`,
        ApplicationExceptionCode.TARBALL_EXTRACTION_FAILED,
      );
    }
  }

  // Note: .npmrc settings take precedence over publishConfig.registry in
  // individual packages. This is correct for our use case since we want
  // to control the registry at the resolver level.
  private async writeNpmrc(config: {
    workDir: string;
    packageName: string;
    registryUrl: string;
    authToken?: string;
  }): Promise<void> {
    const lines: string[] = [];
    const registryHost = new URL(config.registryUrl).host;

    if (config.packageName.startsWith('@')) {
      const scope = config.packageName.split('/')[0];

      lines.push(`${scope}:registry=${config.registryUrl}`);
    } else if (config.registryUrl !== 'https://registry.npmjs.org') {
      lines.push(`registry=${config.registryUrl}`);
    }

    if (config.authToken) {
      lines.push(`//${registryHost}/:_authToken=${config.authToken}`);
    }

    if (lines.length > 0) {
      await fs.writeFile(
        join(config.workDir, '.npmrc'),
        lines.join('\n') + '\n',
      );
    }
  }

  private async setupYarnEngine(workDir: string): Promise<void> {
    await fs.cp(YARN_ENGINE_DIRNAME, workDir, { recursive: true });
  }

  private async writeMinimalPackageJson(
    workDir: string,
    packageName: string,
    versionSpec: string,
  ): Promise<void> {
    const packageJson = {
      name: 'twenty-app-resolver-workspace',
      private: true,
      dependencies: {
        [packageName]: versionSpec,
      },
    };

    await fs.writeFile(
      join(workDir, 'package.json'),
      JSON.stringify(packageJson, null, 2),
    );
  }

  private async resolveLocalYarnPath(workDir: string): Promise<string> {
    const yarnrcPath = join(workDir, '.yarnrc.yml');
    const yarnrcContent = await fs.readFile(yarnrcPath, 'utf-8');
    const match = yarnrcContent.match(/^yarnPath:\s*(.+)$/m);

    if (!match) {
      throw new ApplicationException(
        'yarnPath not found in .yarnrc.yml',
        ApplicationExceptionCode.PACKAGE_RESOLUTION_FAILED,
      );
    }

    return join(workDir, match[1].trim());
  }

  private async runYarnInstall(workDir: string): Promise<void> {
    const localYarnPath = await this.resolveLocalYarnPath(workDir);

    const { NODE_OPTIONS: _nodeOptions, ...cleanEnv } = process.env;

    try {
      await execFilePromise(
        process.execPath,
        [localYarnPath, 'install', '--no-immutable'],
        {
          cwd: workDir,
          env: cleanEnv,
          timeout: RESOLUTION_TIMEOUT_MS,
        },
      );
    } catch (error: unknown) {
      const stderr =
        isDefined(error) &&
        typeof error === 'object' &&
        'stderr' in error &&
        typeof (error as { stderr: unknown }).stderr === 'string'
          ? (error as { stderr: string }).stderr
          : undefined;

      const message =
        stderr ?? (error instanceof Error ? error.message : String(error));

      throw new ApplicationException(
        `yarn install failed: ${message}`,
        ApplicationExceptionCode.PACKAGE_RESOLUTION_FAILED,
      );
    }
  }
}
