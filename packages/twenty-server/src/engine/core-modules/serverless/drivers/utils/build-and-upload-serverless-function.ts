import { join } from 'path';
import fs from 'fs/promises';

import { build } from 'esbuild';

import { getServerlessFolderOrThrow } from 'src/engine/core-modules/serverless/utils/serverless-get-folder.utils';
import { LambdaBuildDirectoryManager } from 'src/engine/core-modules/serverless/drivers/utils/lambda-build-directory-manager';
import { type FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';
import { type FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { DEFAULT_BUILT_HANDLER_PATH } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';

const buildServerlessFunctionInMemory = async ({
  sourceTemporaryDir,
  handlerPath,
}: {
  sourceTemporaryDir: string;
  handlerPath: string;
}): Promise<string> => {
  const entryFilePath = join(sourceTemporaryDir, handlerPath);
  const builtBundleFilePath = join(
    sourceTemporaryDir,
    DEFAULT_BUILT_HANDLER_PATH,
  );

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
}): Promise<string> => {
  const folderPath = getServerlessFolderOrThrow({
    flatServerlessFunction,
    version,
  });

  const lambdaBuildDirectoryManager = new LambdaBuildDirectoryManager();

  try {
    const { sourceTemporaryDir } = await lambdaBuildDirectoryManager.init();

    await fileStorageService.download({
      from: { folderPath },
      to: { folderPath: sourceTemporaryDir },
    });

    const builtBundleFilePath = await buildServerlessFunctionInMemory({
      sourceTemporaryDir,
      handlerPath: flatServerlessFunction.handlerPath,
    });

    const builtFile = await fs.readFile(builtBundleFilePath, 'utf-8');

    await fileStorageService.write({
      file: builtFile,
      name: DEFAULT_BUILT_HANDLER_PATH,
      mimeType: 'application/javascript',
      folder: folderPath,
    });

    return join(folderPath, DEFAULT_BUILT_HANDLER_PATH);
  } finally {
    await lambdaBuildDirectoryManager.clean();
  }
};
