import { Injectable } from '@nestjs/common';

import crypto from 'crypto';
import fs from 'fs/promises';
import { dirname, join } from 'path';

import { isObject } from '@sniptt/guards';
import { build } from 'esbuild';
import { FileFolder, Sources } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { NODE_ESM_CJS_BANNER } from 'twenty-shared/application';

import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { TemporaryDirManager } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/temporary-dir-manager';
import {
  getLogicFunctionSeedProjectFiles,
  LogicFunctionSeedProjectFile,
} from 'src/engine/core-modules/logic-function/logic-function-resource/utils/get-logic-function-seed-project-files.util';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { streamToBuffer } from 'src/utils/stream-to-buffer';
import { getBuiltHandlerPathFromSourceHandlerPath } from 'src/engine/core-modules/logic-function/logic-function-resource/utils/get-built-handler-path-from-source-handler-path';

type SeedSourceFilesParams = {
  sourceHandlerPath: string;
  workspaceId: string;
  applicationUniversalIdentifier: string;
};

type SeedSourceFilesResult = {
  sourceHandlerPath: string;
  handlerName: string;
  checksum: string;
};

type UpdateSourceFilesParams = SeedSourceFilesParams & {
  sourceHandlerCode: string;
};

type BuildFromSourceParams = {
  sourceHandlerPath: string;
  workspaceId: string;
  applicationUniversalIdentifier: string;
};

type GetSourceCodeParams = {
  sourceHandlerPath: string;
  workspaceId: string;
  applicationUniversalIdentifier: string;
};

type CopySourceParams = {
  fromSourceHandlerPath: string;
  toSourceHandlerPath: string;
  workspaceId: string;
  applicationUniversalIdentifier: string;
};

@Injectable()
export class LogicFunctionResourceService {
  constructor(private readonly fileStorageService: FileStorageService) {}

  async seedSourceFiles({
    workspaceId,
    applicationUniversalIdentifier,
    sourceHandlerPath,
  }: SeedSourceFilesParams): Promise<SeedSourceFilesResult> {
    const builtHandlerPath =
      getBuiltHandlerPathFromSourceHandlerPath(sourceHandlerPath);

    const seedProjectFiles = await getLogicFunctionSeedProjectFiles();

    const sourceFiles = seedProjectFiles.filter(
      (file: LogicFunctionSeedProjectFile) => file.name.endsWith('index.ts'),
    );
    const builtFiles = seedProjectFiles.filter(
      (file: LogicFunctionSeedProjectFile) => file.name.endsWith('.mjs'),
    );

    if (sourceFiles.length !== 1 || builtFiles.length !== 1) {
      throw new LogicFunctionException(
        'Logic function seed project should have one index.ts file and one index.mjs file',
        LogicFunctionExceptionCode.LOGIC_FUNCTION_INVALID_SEED_PROJECT,
      );
    }

    const sourceFile = sourceFiles[0];
    const builtFile = builtFiles[0];

    await this.fileStorageService.writeFile({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.Source,
      resourcePath: sourceHandlerPath,
      sourceFile: sourceFile.content,
      mimeType: 'application/typescript',
      settings: {
        isTemporaryFile: false,
        toDelete: false,
      },
    });

    await this.fileStorageService.writeFile({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.BuiltLogicFunction,
      resourcePath: builtHandlerPath,
      sourceFile: builtFile.content,
      mimeType: 'application/javascript',
      settings: {
        isTemporaryFile: false,
        toDelete: false,
      },
    });

    const checksum = crypto
      .createHash('md5')
      .update(builtFile.content)
      .digest('hex');

    return {
      handlerName: 'main',
      sourceHandlerPath,
      checksum,
    };
  }

  async uploadSourceFile({
    sourceHandlerPath,
    workspaceId,
    applicationUniversalIdentifier,
    sourceHandlerCode,
  }: UpdateSourceFilesParams): Promise<void> {
    await this.fileStorageService.writeFile({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.Source,
      resourcePath: sourceHandlerPath,
      sourceFile: sourceHandlerCode,
      settings: { isTemporaryFile: false, toDelete: false },
      mimeType: 'application/typescript',
    });
  }

  async buildFromSourceFile({
    sourceHandlerPath,
    workspaceId,
    applicationUniversalIdentifier,
  }: BuildFromSourceParams): Promise<{ checksum: string }> {
    const temporaryDirManager = new TemporaryDirManager();

    try {
      const { sourceTemporaryDir } = await temporaryDirManager.init();

      await this.fileStorageService.downloadFile({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.Source,
        resourcePath: sourceHandlerPath,
        localPath: join(sourceTemporaryDir, sourceHandlerPath),
      });

      const builtHandlerPath =
        getBuiltHandlerPathFromSourceHandlerPath(sourceHandlerPath);

      const builtBundleFilePath = await this.buildInMemory({
        sourceTemporaryDir,
        sourceHandlerPath: sourceHandlerPath,
        builtHandlerPath: builtHandlerPath,
      });

      const builtFile = await fs.readFile(builtBundleFilePath, 'utf-8');

      await this.fileStorageService.writeFile({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.BuiltLogicFunction,
        resourcePath: builtHandlerPath,
        sourceFile: builtFile,
        mimeType: 'application/javascript',
        settings: {
          isTemporaryFile: false,
          toDelete: false,
        },
      });

      return {
        checksum: crypto.createHash('md5').update(builtFile).digest('hex'),
      };
    } finally {
      await temporaryDirManager.clean();
    }
  }

  async getSourceFile({
    sourceHandlerPath,
    workspaceId,
    applicationUniversalIdentifier,
  }: GetSourceCodeParams): Promise<string | null> {
    try {
      return (
        await streamToBuffer(
          await this.fileStorageService.readFile({
            workspaceId,
            applicationUniversalIdentifier,
            fileFolder: FileFolder.Source,
            resourcePath: sourceHandlerPath,
          }),
        )
      ).toString('utf-8');
    } catch (error) {
      if (
        isDefined(error) &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === FileStorageExceptionCode.FILE_NOT_FOUND
      ) {
        return null;
      }
      throw error;
    }
  }

  async copyResources({
    fromSourceHandlerPath,
    toSourceHandlerPath,
    workspaceId,
    applicationUniversalIdentifier,
  }: CopySourceParams): Promise<void> {
    const fromBuiltHandlerPath = getBuiltHandlerPathFromSourceHandlerPath(
      fromSourceHandlerPath,
    );

    const toBuiltHandlerPath =
      getBuiltHandlerPathFromSourceHandlerPath(toSourceHandlerPath);

    await this.fileStorageService.copy({
      from: {
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.Source,
        resourcePath: fromSourceHandlerPath,
      },
      to: {
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.Source,
        resourcePath: toSourceHandlerPath,
      },
    });

    await this.fileStorageService.copy({
      from: {
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.BuiltLogicFunction,
        resourcePath: fromBuiltHandlerPath,
      },
      to: {
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.BuiltLogicFunction,
        resourcePath: toBuiltHandlerPath,
      },
    });
  }

  async copyDependenciesInMemory({
    applicationUniversalIdentifier,
    workspaceId,
    inMemoryFolderPath,
  }: {
    applicationUniversalIdentifier: string;
    workspaceId: string;
    inMemoryFolderPath: string;
  }) {
    await Promise.all([
      this.fileStorageService.downloadFile({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.Dependencies,
        resourcePath: 'package.json',
        localPath: join(inMemoryFolderPath, 'package.json'),
      }),
      this.fileStorageService.downloadFile({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.Dependencies,
        resourcePath: 'yarn.lock',
        localPath: join(inMemoryFolderPath, 'yarn.lock'),
      }),
    ]);
  }

  async getBuiltCode({
    sourceHandlerPath,
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    sourceHandlerPath: string;
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }): Promise<string> {
    const builtHandlerPath =
      getBuiltHandlerPathFromSourceHandlerPath(sourceHandlerPath);

    return (
      await streamToBuffer(
        await this.fileStorageService.readFile({
          workspaceId: workspaceId,
          applicationUniversalIdentifier,
          fileFolder: FileFolder.BuiltLogicFunction,
          resourcePath: builtHandlerPath,
        }),
      )
    ).toString('utf-8');
  }

  async copyBuiltCodeInMemory({
    sourceHandlerPath,
    workspaceId,
    applicationUniversalIdentifier,
    inMemoryDestinationPath,
  }: {
    sourceHandlerPath: string;
    workspaceId: string;
    applicationUniversalIdentifier: string;
    inMemoryDestinationPath: string;
  }): Promise<string> {
    const builtHandlerPath =
      getBuiltHandlerPathFromSourceHandlerPath(sourceHandlerPath);

    const localPath = join(inMemoryDestinationPath, builtHandlerPath);

    await this.fileStorageService.downloadFile({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.BuiltLogicFunction,
      resourcePath: builtHandlerPath,
      localPath,
    });

    return localPath;
  }

  async writeSourcesToLocalFolder(
    sources: Sources,
    localPath: string,
  ): Promise<void> {
    for (const key of Object.keys(sources)) {
      const filePath = join(localPath, key);
      const value = sources[key];

      if (isObject(value)) {
        await this.writeSourcesToLocalFolder(value as Sources, filePath);
        continue;
      }
      await fs.mkdir(dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, value);
    }
  }

  private async buildInMemory({
    sourceTemporaryDir,
    sourceHandlerPath,
    builtHandlerPath,
  }: {
    sourceTemporaryDir: string;
    sourceHandlerPath: string;
    builtHandlerPath: string;
  }): Promise<string> {
    const entryFilePath = join(sourceTemporaryDir, sourceHandlerPath);
    const builtBundleFilePath = join(sourceTemporaryDir, builtHandlerPath);

    await fs.mkdir(dirname(builtBundleFilePath), { recursive: true });

    await build({
      entryPoints: [entryFilePath],
      outfile: builtBundleFilePath,
      platform: 'node',
      format: 'esm',
      target: 'es2017',
      bundle: true,
      sourcemap: true,
      packages: 'external',
      banner: NODE_ESM_CJS_BANNER,
    });

    return builtBundleFilePath;
  }
}
