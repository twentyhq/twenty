import {
  APPLICATION_PACKAGE_YARN_LOCK_PATH,
  type Manifest,
} from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export type ApplicationFileToStore = {
  relativePath: string;
  resourcePath?: string;
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
      relativePath: APPLICATION_PACKAGE_YARN_LOCK_PATH,
      resourcePath: 'yarn.lock',
      fileFolder: FileFolder.Dependencies,
      isRequired: false,
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

  const sharedDependencies =
    manifest.application.frontComponentSharedDependencies;

  if (isDefined(sharedDependencies)) {
    files.push({
      relativePath: sharedDependencies.builtPath,
      fileFolder: FileFolder.BuiltFrontComponent,
      isRequired: true,
    });
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
