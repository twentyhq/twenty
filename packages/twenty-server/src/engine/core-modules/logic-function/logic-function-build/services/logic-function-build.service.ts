import { Injectable } from '@nestjs/common';

import fs from 'fs/promises';
import { dirname, join } from 'path';
import crypto from 'crypto';

import { build } from 'esbuild';
import { FileFolder } from 'twenty-shared/types';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { LambdaBuildDirectoryManager } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/lambda-build-directory-manager';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import {
  getLogicFunctionBaseFolderPath,
  getRelativePathFromBase,
} from 'src/engine/core-modules/logic-function/logic-function-build/utils/get-logic-function-base-folder-path.util';
import { FlatLogicFunctionLayer } from 'src/engine/metadata-modules/logic-function-layer/types/flat-logic-function-layer.type';

export type FunctionBuildParams = {
  flatLogicFunction: FlatLogicFunction;
  applicationUniversalIdentifier: string;
};

@Injectable()
export class LogicFunctionBuildService {
  constructor(private readonly fileStorageService: FileStorageService) {}

  async hasLayerDependencies({
    flatLogicFunctionLayer,
    applicationUniversalIdentifier,
  }: {
    flatLogicFunctionLayer: FlatLogicFunctionLayer;
    applicationUniversalIdentifier: string;
  }): Promise<boolean> {
    const packageJsonExists = await this.fileStorageService.checkFileExists_v2({
      workspaceId: flatLogicFunctionLayer.workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.Source,
      resourcePath: 'package.json',
    });

    const yarnLockExists = await this.fileStorageService.checkFileExists_v2({
      workspaceId: flatLogicFunctionLayer.workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.Source,
      resourcePath: 'yarn.lock',
    });

    return packageJsonExists && yarnLockExists;
  }

  async uploadDependencies({
    flatLogicFunctionLayer,
    applicationUniversalIdentifier,
  }: {
    flatLogicFunctionLayer: FlatLogicFunctionLayer;
    applicationUniversalIdentifier: string;
  }) {
    await this.fileStorageService.writeFile_v2({
      workspaceId: flatLogicFunctionLayer.workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.Source,
      resourcePath: 'package.json',
      sourceFile: JSON.stringify(flatLogicFunctionLayer.packageJson, null, 2),
      mimeType: undefined,
      settings: {
        isTemporaryFile: false,
        toDelete: false,
      },
    });

    await this.fileStorageService.writeFile_v2({
      workspaceId: flatLogicFunctionLayer.workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.Source,
      resourcePath: 'yarn.lock',
      sourceFile: flatLogicFunctionLayer.yarnLock,
      mimeType: undefined,
      settings: {
        isTemporaryFile: false,
        toDelete: false,
      },
    });
  }

  async isBuilt({
    flatLogicFunction,
    applicationUniversalIdentifier,
  }: FunctionBuildParams): Promise<boolean> {
    return await this.fileStorageService.checkFileExists_v2({
      workspaceId: flatLogicFunction.workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.BuiltLogicFunction,
      resourcePath: flatLogicFunction.builtHandlerPath,
    });
  }

  async buildAndUpload({
    flatLogicFunction,
    applicationUniversalIdentifier,
  }: FunctionBuildParams): Promise<{ checksum: string }> {
    const lambdaBuildDirectoryManager = new LambdaBuildDirectoryManager();

    try {
      const { sourceTemporaryDir } = await lambdaBuildDirectoryManager.init();

      const baseFolderPath = getLogicFunctionBaseFolderPath(
        flatLogicFunction.sourceHandlerPath,
      );

      await this.fileStorageService.downloadFolder_v2({
        workspaceId: flatLogicFunction.workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.Source,
        resourcePath: baseFolderPath,
        localPath: sourceTemporaryDir,
      });

      const relativeSourcePath = getRelativePathFromBase(
        flatLogicFunction.sourceHandlerPath,
        baseFolderPath,
      );
      const relativeBuiltPath = getRelativePathFromBase(
        flatLogicFunction.builtHandlerPath,
        baseFolderPath,
      );

      const builtBundleFilePath = await this.buildInMemory({
        sourceTemporaryDir,
        sourceHandlerPath: relativeSourcePath,
        builtHandlerPath: relativeBuiltPath,
      });

      const builtFile = await fs.readFile(builtBundleFilePath, 'utf-8');

      await this.fileStorageService.writeFile_v2({
        workspaceId: flatLogicFunction.workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.BuiltLogicFunction,
        resourcePath: flatLogicFunction.builtHandlerPath,
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
