import { buildFrontComponents } from '@/cli/utilities/build/common/build-front-components';
import { buildLogicFunctions } from '@/cli/utilities/build/common/build-logic-functions';
import { type OnFileBuiltCallback } from '@/cli/utilities/build/common/restartable-watcher-interface';
import { type EntityFilePaths } from '@/cli/utilities/build/manifest/manifest-extract-config';
import crypto from 'crypto';
import * as fs from 'fs-extra';
import { dirname, join } from 'path';
import { OUTPUT_DIR, type Manifest } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';

export type AppBuildOptions = {
  appPath: string;
  manifest: Manifest;
  filePaths: EntityFilePaths;
};

export type BuiltFileInfo = {
  checksum: string;
  builtPath: string;
  sourcePath: string;
  fileFolder: FileFolder;
};

export type AppBuildResult = {
  builtFileInfos: Map<string, BuiltFileInfo>;
};

export const appBuild = async (
  options: AppBuildOptions,
): Promise<AppBuildResult> => {
  const outputDir = join(options.appPath, OUTPUT_DIR);

  await fs.ensureDir(outputDir);
  await fs.emptyDir(outputDir);

  const builtFileInfos = new Map<string, BuiltFileInfo>();

  const collectFileBuilt: OnFileBuiltCallback = (event) => {
    builtFileInfos.set(event.builtPath, {
      checksum: event.checksum,
      builtPath: event.builtPath,
      sourcePath: event.sourcePath,
      fileFolder: event.fileFolder,
    });
  };

  const { logicFunctions, frontComponents } = options.filePaths;

  await buildLogicFunctions({
    appPath: options.appPath,
    sourcePaths: logicFunctions,
    onFileBuilt: collectFileBuilt,
  });

  await buildFrontComponents({
    appPath: options.appPath,
    sourcePaths: frontComponents,
    onFileBuilt: collectFileBuilt,
  });

  await copyStaticFiles({
    appPath: options.appPath,
    fileFolder: FileFolder.PublicAsset,
    filePaths: options.filePaths.publicAssets,
    collectFileBuilt,
  });

  await copyStaticFiles({
    appPath: options.appPath,
    fileFolder: FileFolder.Dependencies,
    filePaths: ['package.json', 'yarn.lock'].filter((filePath) =>
      fs.pathExistsSync(join(options.appPath, filePath)),
    ),
    collectFileBuilt,
  });

  return { builtFileInfos };
};

const copyStaticFiles = async ({
  appPath,
  fileFolder,
  filePaths,
  collectFileBuilt,
}: {
  appPath: string;
  fileFolder: FileFolder;
  filePaths: string[];
  collectFileBuilt: OnFileBuiltCallback;
}) => {
  for (const sourcePath of filePaths) {
    const absoluteSourcePath = join(appPath, sourcePath);

    if (!(await fs.pathExists(absoluteSourcePath))) {
      continue;
    }

    const builtPath = join(OUTPUT_DIR, sourcePath);
    const absoluteBuiltPath = join(appPath, builtPath);

    await fs.ensureDir(dirname(absoluteBuiltPath));
    await fs.copy(absoluteSourcePath, absoluteBuiltPath);

    const content = await fs.readFile(absoluteBuiltPath);
    const checksum = crypto.createHash('md5').update(content).digest('hex');

    collectFileBuilt({
      fileFolder,
      builtPath,
      sourcePath,
      checksum,
    });
  }
};
