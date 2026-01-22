import type { FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';
import type { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { getServerlessFolderOrThrow } from 'src/engine/core-modules/serverless/utils/get-serverless-folder-or-throw.utils';

export const isServerlessFunctionBuilt = async ({
  flatServerlessFunction,
  version,
  fileStorageService,
}: {
  flatServerlessFunction: FlatServerlessFunction;
  version: string;
  fileStorageService: FileStorageService;
}) => {
  const folderPath = getServerlessFolderOrThrow({
    flatServerlessFunction,
    version,
  });

  return await fileStorageService.checkFileExists({
    folderPath,
    filename: flatServerlessFunction.builtHandlerPath,
  });
};
