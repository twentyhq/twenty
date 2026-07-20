import { type Manifest } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';

export type ApplicationFileToStore = {
  relativePath: string;
  fileFolder: FileFolder;
  isRequired: boolean;
};

export const buildApplicationFileList = (
  manifest: Manifest,
): ApplicationFileToStore[] => {
  const files: ApplicationFileToStore[] = [
    {
      relativePath: 'package.json',
      fileFolder: FileFolder.Dependencies,
      isRequired: true,
    },
    {
      relativePath: 'manifest.json',
      fileFolder: FileFolder.Source,
      isRequired: true,
    },
  ];

  for (const logicFunction of manifest.logicFunctions ?? []) {
    files.push(
      {
        relativePath: logicFunction.sourceHandlerPath,
        fileFolder: FileFolder.Source,
        isRequired: false,
      },
      {
        relativePath: logicFunction.builtHandlerPath,
        fileFolder: FileFolder.BuiltLogicFunction,
        isRequired: true,
      },
    );
  }

  for (const frontComponent of manifest.frontComponents ?? []) {
    files.push(
      {
        relativePath: frontComponent.sourceComponentPath,
        fileFolder: FileFolder.Source,
        isRequired: false,
      },
      {
        relativePath: frontComponent.builtComponentPath,
        fileFolder: FileFolder.BuiltFrontComponent,
        isRequired: true,
      },
    );
  }

  for (const publicAsset of manifest.publicAssets ?? []) {
    files.push({
      relativePath: publicAsset.filePath,
      fileFolder: FileFolder.PublicAsset,
      isRequired: true,
    });
  }

  return files;
};
