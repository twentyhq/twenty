import { type Manifest } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';

export type ApplicationPackageFile = {
  relativePath: string;
  fileFolder: FileFolder;
};

export const buildApplicationPackageFileList = (
  manifest: Manifest,
): ApplicationPackageFile[] => {
  const files: ApplicationPackageFile[] = [
    { relativePath: 'package.json', fileFolder: FileFolder.Dependencies },
  ];

  for (const logicFunction of manifest.logicFunctions ?? []) {
    files.push({
      relativePath: logicFunction.builtHandlerPath,
      fileFolder: FileFolder.BuiltLogicFunction,
    });
  }

  for (const frontComponent of manifest.frontComponents ?? []) {
    files.push({
      relativePath: frontComponent.builtComponentPath,
      fileFolder: FileFolder.BuiltFrontComponent,
    });
  }

  for (const publicAsset of manifest.publicAssets ?? []) {
    files.push({
      relativePath: publicAsset.filePath,
      fileFolder: FileFolder.PublicAsset,
    });
  }

  return files;
};
