import { join } from 'path';
import fs from 'fs/promises';

import { build } from 'esbuild';
import { FileFolder } from 'twenty-shared/types';

import { getServerlessFolderOrThrow } from 'src/engine/core-modules/serverless/utils/get-serverless-folder-or-throw.utils';
import { LambdaBuildDirectoryManager } from 'src/engine/core-modules/serverless/drivers/utils/lambda-build-directory-manager';
import { type FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';
import { type FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';

const buildServerlessFunctionInMemory = async ({
  sourceTemporaryDir,
  handlerPath,
  builtHandlerPath,
}: {
  sourceTemporaryDir: string;
  handlerPath: string;
  builtHandlerPath: string;
}): Promise<string> => {
  const entryFilePath = join(sourceTemporaryDir, handlerPath);
  const builtBundleFilePath = join(sourceTemporaryDir, builtHandlerPath);

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
};

export const buildAndUploadServerlessFunction = async ({
  flatServerlessFunction,
  version,
  fileStorageService,
}: {
  flatServerlessFunction: FlatServerlessFunction;
  version: string;
  fileStorageService: FileStorageService;
}): Promise<void> => {
  const sourceFolderPath = getServerlessFolderOrThrow({
    flatServerlessFunction,
    version,
    fileFolder: FileFolder.ServerlessFunction,
  });

  const builtFolderPath = getServerlessFolderOrThrow({
    flatServerlessFunction,
    version,
    fileFolder: FileFolder.BuiltFunction,
  });

  const lambdaBuildDirectoryManager = new LambdaBuildDirectoryManager();

  try {
    const { sourceTemporaryDir } = await lambdaBuildDirectoryManager.init();

    await fileStorageService.download({
      from: { folderPath: sourceFolderPath },
      to: { folderPath: sourceTemporaryDir },
    });

    const builtBundleFilePath = await buildServerlessFunctionInMemory({
      sourceTemporaryDir,
      handlerPath: flatServerlessFunction.handlerPath,
      builtHandlerPath: flatServerlessFunction.builtHandlerPath,
    });

    const builtFile = await fs.readFile(builtBundleFilePath, 'utf-8');

    await fileStorageService.write({
      file: builtFile,
      name: flatServerlessFunction.builtHandlerPath,
      mimeType: 'application/javascript',
      folder: builtFolderPath,
    });
  } finally {
    await lambdaBuildDirectoryManager.clean();
  }
};
