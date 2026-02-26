import { Injectable, Logger } from '@nestjs/common';

import * as fs from 'fs/promises';
import { tmpdir } from 'os';
import { basename, join } from 'path';

import { extract, type ReadEntry } from 'tar';
import {
  type LogicFunctionManifest,
  type Manifest,
} from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationSyncService } from 'src/engine/core-modules/application/services/application-sync.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { extractFileInfo } from 'src/engine/core-modules/file/utils/extract-file-info.utils';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const MAX_EXTRACTED_SIZE_BYTES = 500 * 1024 * 1024;

type FileFolderMapping = {
  fileFolder: FileFolder;
  resourcePath: string;
};

type InstallHookIdentifiers = {
  preInstallLogicFunctionUniversalIdentifier: string | undefined;
  postInstallLogicFunctionUniversalIdentifier: string | undefined;
};

@Injectable()
export class ApplicationInstallService {
  private readonly logger = new Logger(ApplicationInstallService.name);

  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly fileStorageService: FileStorageService,
    private readonly applicationSyncService: ApplicationSyncService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async installApplication({
    applicationUniversalIdentifier,
    version,
    workspaceId,
  }: {
    applicationUniversalIdentifier: string;
    version: string;
    workspaceId: string;
  }): Promise<boolean> {
    const temporaryDir = join(tmpdir(), `application-install-${v4()}`);

    try {
      await fs.mkdir(temporaryDir, { recursive: true });

      const tarballPath = await this.downloadTarball({
        applicationUniversalIdentifier,
        version,
        temporaryDir,
        workspaceId,
      });

      await this.extractTarball({ tarballPath, temporaryDir });

      const manifest = await this.readManifest(temporaryDir);

      await this.writeExtractedFilesToStorage({
        extractedDir: temporaryDir,
        applicationUniversalIdentifier,
        workspaceId,
      });

      const hookIdentifiers = this.resolveInstallHookIdentifiers(manifest);

      const hookLogicFunctions = this.extractHookLogicFunctions({
        manifest,
        hookIdentifiers,
      });

      if (hookLogicFunctions.length > 0) {
        const hooksOnlyManifest = this.buildHooksOnlyManifest({
          manifest,
          hookLogicFunctions,
        });

        await this.applicationSyncService.synchronizeFromManifest({
          workspaceId,
          manifest: hooksOnlyManifest,
        });
      }

      await this.executeInstallHook({
        hookUniversalIdentifier:
          hookIdentifiers.preInstallLogicFunctionUniversalIdentifier,
        hookName: 'preInstall',
        workspaceId,
        applicationUniversalIdentifier,
        version,
      });

      await this.applicationSyncService.synchronizeFromManifest({
        workspaceId,
        manifest,
      });

      await this.executeInstallHook({
        hookUniversalIdentifier:
          hookIdentifiers.postInstallLogicFunctionUniversalIdentifier,
        hookName: 'postInstall',
        workspaceId,
        applicationUniversalIdentifier,
        version,
      });

      this.logger.log(
        `Application ${applicationUniversalIdentifier}@${version} installed successfully`,
      );

      return true;
    } finally {
      await fs.rm(temporaryDir, { recursive: true, force: true });
    }
  }

  private async downloadTarball({
    applicationUniversalIdentifier,
    version,
    temporaryDir,
    workspaceId,
  }: {
    applicationUniversalIdentifier: string;
    version: string;
    temporaryDir: string;
    workspaceId: string;
  }): Promise<string> {
    const registryUrl = this.twentyConfigService.get(
      'APPLICATION_REGISTRY_URL',
    );
    const tarballUrl = `${registryUrl}/${applicationUniversalIdentifier}@${version}/app.tar.gz`;

    this.logger.log(`Downloading tarball from ${tarballUrl}`);

    const httpClient = this.secureHttpClientService.getHttpClient(
      { responseType: 'arraybuffer', timeout: 60_000 },
      {
        workspaceId,
        source: 'application-install',
      },
    );

    let response: { data: ArrayBuffer; status: number };

    try {
      response = await httpClient.get(tarballUrl);
    } catch (error: unknown) {
      const isAxiosError =
        error !== null &&
        typeof error === 'object' &&
        'response' in error &&
        typeof (error as { response?: { status?: number } }).response
          ?.status === 'number';

      if (isAxiosError) {
        const status = (error as { response: { status: number } }).response
          .status;

        if (status === 404) {
          throw new ApplicationException(
            `Tarball not found for ${applicationUniversalIdentifier}@${version}`,
            ApplicationExceptionCode.APPLICATION_NOT_FOUND,
          );
        }
      }

      throw new ApplicationException(
        `Failed to download tarball for ${applicationUniversalIdentifier}@${version}: ${error instanceof Error ? error.message : String(error)}`,
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }

    const tarballPath = join(temporaryDir, 'app.tar.gz');

    await fs.writeFile(tarballPath, Buffer.from(response.data));

    return tarballPath;
  }

  private async extractTarball({
    tarballPath,
    temporaryDir,
  }: {
    tarballPath: string;
    temporaryDir: string;
  }): Promise<void> {
    let totalExtractedSize = 0;

    try {
      await extract({
        file: tarballPath,
        cwd: temporaryDir,
        filter: (path, entry) => {
          if (path.includes('..')) {
            this.logger.warn(`Skipping path traversal entry: ${path}`);

            return false;
          }

          if ('type' in entry) {
            const readEntry = entry as ReadEntry;

            if (
              readEntry.type === 'SymbolicLink' ||
              readEntry.type === 'Link'
            ) {
              this.logger.warn(`Skipping symlink entry: ${path}`);

              return false;
            }
          }

          totalExtractedSize += entry.size ?? 0;

          if (totalExtractedSize > MAX_EXTRACTED_SIZE_BYTES) {
            throw new ApplicationException(
              `Extracted tarball exceeds maximum allowed size of ${MAX_EXTRACTED_SIZE_BYTES} bytes`,
              ApplicationExceptionCode.INVALID_INPUT,
            );
          }

          return true;
        },
      });
    } catch (error) {
      if (error instanceof ApplicationException) {
        throw error;
      }

      throw new ApplicationException(
        `Failed to extract tarball: ${error instanceof Error ? error.message : String(error)}`,
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }

    await fs.rm(tarballPath);
  }

  private async readManifest(extractedDir: string): Promise<Manifest> {
    const manifestPath = join(extractedDir, 'manifest.json');

    let manifestContent: string;

    try {
      manifestContent = await fs.readFile(manifestPath, 'utf-8');
    } catch {
      throw new ApplicationException(
        'manifest.json not found in tarball',
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }

    try {
      return JSON.parse(manifestContent) as Manifest;
    } catch {
      throw new ApplicationException(
        'Failed to parse manifest.json',
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }
  }

  private resolveFileFolderMapping(
    relativePath: string,
  ): FileFolderMapping | null {
    if (relativePath === 'manifest.json') {
      return null;
    }

    if (relativePath === 'package.json') {
      return {
        fileFolder: FileFolder.Dependencies,
        resourcePath: 'package.json',
      };
    }

    if (relativePath === 'yarn.lock') {
      return {
        fileFolder: FileFolder.Dependencies,
        resourcePath: 'yarn.lock',
      };
    }

    if (relativePath.startsWith('public/')) {
      return {
        fileFolder: FileFolder.PublicAsset,
        resourcePath: relativePath,
      };
    }

    if (relativePath.startsWith('src/')) {
      if (
        relativePath.endsWith('.front-component.mjs') ||
        relativePath.endsWith('.front-component.mjs.map')
      ) {
        return {
          fileFolder: FileFolder.BuiltFrontComponent,
          resourcePath: relativePath,
        };
      }

      if (
        relativePath.endsWith('.function.mjs') ||
        relativePath.endsWith('.function.mjs.map')
      ) {
        return {
          fileFolder: FileFolder.BuiltLogicFunction,
          resourcePath: relativePath,
        };
      }

      return {
        fileFolder: FileFolder.Source,
        resourcePath: relativePath,
      };
    }

    return {
      fileFolder: FileFolder.Source,
      resourcePath: relativePath,
    };
  }

  private async writeExtractedFilesToStorage({
    extractedDir,
    applicationUniversalIdentifier,
    workspaceId,
  }: {
    extractedDir: string;
    applicationUniversalIdentifier: string;
    workspaceId: string;
  }): Promise<void> {
    const filePaths = await this.collectFilePaths(extractedDir, '');

    for (const relativePath of filePaths) {
      const mapping = this.resolveFileFolderMapping(relativePath);

      if (mapping === null) {
        continue;
      }

      const absolutePath = join(extractedDir, relativePath);
      const fileContent = await fs.readFile(absolutePath);

      const { mimeType } = await extractFileInfo({
        file: fileContent,
        filename: basename(relativePath),
      });

      await this.fileStorageService.writeFile({
        sourceFile: fileContent,
        mimeType,
        fileFolder: mapping.fileFolder,
        applicationUniversalIdentifier,
        workspaceId,
        resourcePath: mapping.resourcePath,
        settings: {
          isTemporaryFile: false,
          toDelete: false,
        },
      });
    }
  }

  private async collectFilePaths(
    directory: string,
    prefix: string,
  ): Promise<string[]> {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const filePaths: string[] = [];

    for (const entry of entries) {
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        const nestedPaths = await this.collectFilePaths(
          join(directory, entry.name),
          relativePath,
        );

        filePaths.push(...nestedPaths);
      } else if (entry.isFile()) {
        filePaths.push(relativePath);
      }
    }

    return filePaths;
  }

  private resolveInstallHookIdentifiers(
    manifest: Manifest,
  ): InstallHookIdentifiers {
    return {
      preInstallLogicFunctionUniversalIdentifier:
        manifest.application.preInstallLogicFunctionUniversalIdentifier,
      postInstallLogicFunctionUniversalIdentifier:
        manifest.application.postInstallLogicFunctionUniversalIdentifier,
    };
  }

  private extractHookLogicFunctions({
    manifest,
    hookIdentifiers,
  }: {
    manifest: Manifest;
    hookIdentifiers: InstallHookIdentifiers;
  }): LogicFunctionManifest[] {
    const hookUniversalIdentifiers = [
      hookIdentifiers.preInstallLogicFunctionUniversalIdentifier,
      hookIdentifiers.postInstallLogicFunctionUniversalIdentifier,
    ].filter(isDefined);

    if (hookUniversalIdentifiers.length === 0) {
      return [];
    }

    const hookUniversalIdentifierSet = new Set(hookUniversalIdentifiers);

    return manifest.logicFunctions.filter((logicFunction) =>
      hookUniversalIdentifierSet.has(logicFunction.universalIdentifier),
    );
  }

  private buildHooksOnlyManifest({
    manifest,
    hookLogicFunctions,
  }: {
    manifest: Manifest;
    hookLogicFunctions: LogicFunctionManifest[];
  }): Manifest {
    return {
      application: manifest.application,
      logicFunctions: hookLogicFunctions,
      objects: [],
      fields: [],
      frontComponents: [],
      roles: [],
      skills: [],
      publicAssets: [],
      views: [],
      navigationMenuItems: [],
      pageLayouts: [],
    };
  }

  private async executeInstallHook({
    hookUniversalIdentifier,
    hookName,
    workspaceId,
    applicationUniversalIdentifier,
    version,
  }: {
    hookUniversalIdentifier: string | undefined;
    hookName: 'preInstall' | 'postInstall';
    workspaceId: string;
    applicationUniversalIdentifier: string;
    version: string;
  }): Promise<void> {
    if (!isDefined(hookUniversalIdentifier)) {
      return;
    }

    const { flatLogicFunctionMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatLogicFunctionMaps',
      ]);

    const flatLogicFunction =
      flatLogicFunctionMaps.byUniversalIdentifier[hookUniversalIdentifier];

    if (!isDefined(flatLogicFunction)) {
      throw new ApplicationException(
        `${hookName} logic function with universalIdentifier ${hookUniversalIdentifier} not found after manifest sync`,
        ApplicationExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    this.logger.log(
      `Executing ${hookName} hook (${hookUniversalIdentifier}) for ${applicationUniversalIdentifier}@${version}`,
    );

    const result = await this.logicFunctionExecutorService.execute({
      logicFunctionId: flatLogicFunction.id,
      workspaceId,
      payload: {
        applicationUniversalIdentifier,
        version,
      },
    });

    if (result.status === LogicFunctionExecutionStatus.ERROR) {
      throw new ApplicationException(
        `${hookName} hook failed for ${applicationUniversalIdentifier}@${version}: ${result.error?.errorMessage ?? 'Unknown error'}`,
        ApplicationExceptionCode.INSTALL_HOOK_EXECUTION_FAILED,
      );
    }

    this.logger.log(
      `${hookName} hook completed successfully for ${applicationUniversalIdentifier}@${version}`,
    );
  }
}
