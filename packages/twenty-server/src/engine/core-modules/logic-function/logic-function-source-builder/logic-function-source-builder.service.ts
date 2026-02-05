import { Injectable } from '@nestjs/common';

import crypto from 'crypto';
import fs from 'fs/promises';
import { dirname, join } from 'path';

import { isObject } from '@sniptt/guards';
import { build } from 'esbuild';
import { FileFolder, Sources } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { LambdaBuildDirectoryManager } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/lambda-build-directory-manager';
import {
  getLogicFunctionBaseFolderPath,
  getRelativePathFromBase,
} from 'src/engine/core-modules/logic-function/logic-function-source-builder/utils/get-logic-function-handler-path.util';
import {
  getLogicFunctionSeedProjectFiles,
  LogicFunctionSeedProjectFile,
} from 'src/engine/core-modules/logic-function/logic-function-source-builder/utils/get-logic-function-seed-project-files.util';
import {
  DEFAULT_BUILT_HANDLER_PATH,
  DEFAULT_SOURCE_HANDLER_PATH,
} from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

type SeedSourceFilesParams = {
  logicFunctionId: string;
  workspaceId: string;
  applicationUniversalIdentifier: string;
  code?: Sources;
};

type SeedSourceFilesResult = {
  sourceHandlerPath: string;
  builtHandlerPath: string;
  checksum: string;
};

type UpdateSourceFilesParams = {
  sourceHandlerPath: string;
  workspaceId: string;
  applicationUniversalIdentifier: string;
  code: Sources;
};

type BuildFromSourceParams = {
  sourceHandlerPath: string;
  builtHandlerPath: string;
  workspaceId: string;
  applicationUniversalIdentifier: string;
};

type GetSourceCodeParams = {
  sourceHandlerPath: string;
  workspaceId: string;
  applicationUniversalIdentifier: string;
};

type CopySourceAndBuiltParams = {
  fromSourceHandlerPath: string;
  fromBuiltHandlerPath: string;
  toSourceHandlerPath: string;
  toBuiltHandlerPath: string;
  workspaceId: string;
  applicationUniversalIdentifier: string;
};

@Injectable()
export class LogicFunctionSourceBuilderService {
  constructor(private readonly fileStorageService: FileStorageService) {}

  async seedSourceFiles({
    logicFunctionId,
    workspaceId,
    applicationUniversalIdentifier,
    code,
  }: SeedSourceFilesParams): Promise<SeedSourceFilesResult> {
    const sourceHandlerPath = `${logicFunctionId}/${DEFAULT_SOURCE_HANDLER_PATH}`;
    const builtHandlerPath = `${logicFunctionId}/${DEFAULT_BUILT_HANDLER_PATH}`;

    if (isDefined(code)) {
      // Use provided code
      await this.updateSourceFiles({
        sourceHandlerPath,
        workspaceId,
        applicationUniversalIdentifier,
        code,
      });

      const { checksum } = await this.buildFromSource({
        sourceHandlerPath,
        builtHandlerPath,
        workspaceId,
        applicationUniversalIdentifier,
      });

      return {
        sourceHandlerPath,
        builtHandlerPath,
        checksum,
      };
    }

    // Use seed project files
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

    await this.fileStorageService.writeFile_v2({
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

    await this.fileStorageService.writeFile_v2({
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
      sourceHandlerPath,
      builtHandlerPath,
      checksum,
    };
  }

  async updateSourceFiles({
    sourceHandlerPath,
    workspaceId,
    applicationUniversalIdentifier,
    code,
  }: UpdateSourceFilesParams): Promise<void> {
    const lambdaBuildDirectoryManager = new LambdaBuildDirectoryManager();

    try {
      const { sourceTemporaryDir } = await lambdaBuildDirectoryManager.init();

      await this.writeSourcesToLocalFolder(code, sourceTemporaryDir);

      const baseFolderPath = getLogicFunctionBaseFolderPath(sourceHandlerPath);

      await this.fileStorageService.uploadFolder_v2({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.Source,
        resourcePath: baseFolderPath,
        localPath: sourceTemporaryDir,
      });
    } finally {
      await lambdaBuildDirectoryManager.clean();
    }
  }

  async buildFromSource({
    sourceHandlerPath,
    builtHandlerPath,
    workspaceId,
    applicationUniversalIdentifier,
  }: BuildFromSourceParams): Promise<{ checksum: string }> {
    const lambdaBuildDirectoryManager = new LambdaBuildDirectoryManager();

    try {
      const { sourceTemporaryDir } = await lambdaBuildDirectoryManager.init();

      const baseFolderPath = getLogicFunctionBaseFolderPath(sourceHandlerPath);

      await this.fileStorageService.downloadFolder_v2({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.Source,
        resourcePath: baseFolderPath,
        localPath: sourceTemporaryDir,
      });

      const relativeSourcePath = getRelativePathFromBase(
        sourceHandlerPath,
        baseFolderPath,
      );
      const relativeBuiltPath = getRelativePathFromBase(
        builtHandlerPath,
        baseFolderPath,
      );

      const builtBundleFilePath = await this.buildInMemory({
        sourceTemporaryDir,
        sourceHandlerPath: relativeSourcePath,
        builtHandlerPath: relativeBuiltPath,
      });

      const builtFile = await fs.readFile(builtBundleFilePath, 'utf-8');

      await this.fileStorageService.writeFile_v2({
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
      await lambdaBuildDirectoryManager.clean();
    }
  }

  async getSourceCode({
    sourceHandlerPath,
    workspaceId,
    applicationUniversalIdentifier,
  }: GetSourceCodeParams): Promise<Sources | null> {
    const baseFolderPath = getLogicFunctionBaseFolderPath(sourceHandlerPath);

    try {
      return await this.fileStorageService.readFolder_v2({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.Source,
        resourcePath: baseFolderPath,
      });
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

  async copySourceAndBuilt({
    fromSourceHandlerPath,
    fromBuiltHandlerPath,
    toSourceHandlerPath,
    toBuiltHandlerPath,
    workspaceId,
    applicationUniversalIdentifier,
  }: CopySourceAndBuiltParams): Promise<void> {
    const fromSourceBaseFolderPath = getLogicFunctionBaseFolderPath(
      fromSourceHandlerPath,
    );
    const toSourceBaseFolderPath =
      getLogicFunctionBaseFolderPath(toSourceHandlerPath);
    const fromBuiltBaseFolderPath =
      getLogicFunctionBaseFolderPath(fromBuiltHandlerPath);
    const toBuiltBaseFolderPath =
      getLogicFunctionBaseFolderPath(toBuiltHandlerPath);

    await this.fileStorageService.copy_v2({
      from: {
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.Source,
        resourcePath: fromSourceBaseFolderPath,
      },
      to: {
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.Source,
        resourcePath: toSourceBaseFolderPath,
      },
    });

    await this.fileStorageService.copy_v2({
      from: {
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.BuiltLogicFunction,
        resourcePath: fromBuiltBaseFolderPath,
      },
      to: {
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.BuiltLogicFunction,
        resourcePath: toBuiltBaseFolderPath,
      },
    });
  }

  private async writeSourcesToLocalFolder(
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
    });

    return builtBundleFilePath;
  }
}
