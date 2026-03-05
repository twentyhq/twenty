import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';

import { execFile } from 'child_process';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { promisify } from 'util';

import { type Manifest } from 'twenty-shared/application';
import { type PackageJson } from 'type-fest';
import { v4 } from 'uuid';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { YARN_ENGINE_DIRNAME } from 'src/engine/core-modules/application/application-package/constants/yarn-engine-dirname';
import { assertValidNpmPackageName } from 'src/engine/core-modules/application/application-package/utils/assert-valid-npm-package-name.util';
import { extractTarballSecurely } from 'src/engine/core-modules/application/application-package/utils/extract-tarball-securely.util';
import { readJsonFileOrThrow } from 'src/engine/core-modules/application/application-package/utils/read-json-file.util';
import { resolvePackageContentDir } from 'src/engine/core-modules/application/application-package/utils/tarball-utils';
import { FileStorageDriverFactory } from 'src/engine/core-modules/file-storage/file-storage-driver.factory';
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
    private readonly fileStorageDriverFactory: FileStorageDriverFactory,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await fs.rm(APP_FETCHER_TMPDIR, { recursive: true, force: true });
    } catch {
      // best-effort cleanup of stale temp files from previous runs
    }
  }

  async resolvePackage(
    appRegistration: ApplicationRegistrationEntity,
    options?: { targetVersion?: string },
  ): Promise<ResolvedPackage | null> {
    switch (appRegistration.sourceType) {
      case ApplicationRegistrationSourceType.NPM:
        return this.resolveFromNpm(appRegistration, options?.targetVersion);
      case ApplicationRegistrationSourceType.TARBALL:
        return this.resolveFromTarball(appRegistration);
      case ApplicationRegistrationSourceType.LOCAL:
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
    appRegistration: ApplicationRegistrationEntity,
    targetVersion?: string,
  ): Promise<ResolvedPackage> {
    const workDir = join(APP_FETCHER_TMPDIR, v4());

    await fs.mkdir(workDir, { recursive: true });

    try {
      const registryUrl = this.twentyConfigService.get('APP_REGISTRY_URL');

      const authToken = this.twentyConfigService.get('APP_REGISTRY_TOKEN');

      if (!appRegistration.sourcePackage) {
        throw new ApplicationException(
          `App registration ${appRegistration.id} has sourceType=npm but no sourcePackage`,
          ApplicationExceptionCode.PACKAGE_RESOLUTION_FAILED,
        );
      }

      const sourcePackage = appRegistration.sourcePackage;

      assertValidNpmPackageName(sourcePackage);

      const versionSpec = targetVersion ?? 'latest';

      await this.writeNpmrc({
        workDir,
        packageName: sourcePackage,
        registryUrl,
        authToken,
      });
      await this.setupYarnEngine(workDir);
      await this.writeMinimalPackageJson(workDir, sourcePackage, versionSpec);
      await this.runYarnInstall(workDir);

      const packageDir = join(workDir, 'node_modules', sourcePackage);
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
        `Failed to resolve npm package ${appRegistration.sourcePackage}: ${error}`,
        ApplicationExceptionCode.PACKAGE_RESOLUTION_FAILED,
      );
    }
  }

  private async resolveFromTarball(
    appRegistration: ApplicationRegistrationEntity,
  ): Promise<ResolvedPackage> {
    const workDir = join(APP_FETCHER_TMPDIR, v4());

    await fs.mkdir(workDir, { recursive: true });

    try {
      const storagePath = join('app-tarball', appRegistration.id, 'app.tar.gz');
      const driver = this.fileStorageDriverFactory.getCurrentDriver();
      const tarballStream = await driver.readFile({
        filePath: storagePath,
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
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      throw new ApplicationException(
        `yarn install failed: ${errorMessage}`,
        ApplicationExceptionCode.PACKAGE_RESOLUTION_FAILED,
      );
    }
  }
}
