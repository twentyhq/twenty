import { buildFrontComponents } from '@/cli/utilities/build/common/build-front-components';
import { buildLogicFunctions } from '@/cli/utilities/build/common/build-logic-functions';
import { type EsbuildWatcher } from '@/cli/utilities/build/common/esbuild-watcher';
import { type OnFileBuiltCallback } from '@/cli/utilities/build/common/restartable-watcher-interface';
import { type EntityFilePaths } from '@/cli/utilities/build/manifest/manifest-extract-config';
import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';
import { manifestValidate } from '@/cli/utilities/build/manifest/manifest-validate';
import crypto from 'crypto';
import * as fs from 'fs-extra';
import { dirname, join } from 'path';
import { OUTPUT_DIR, type Manifest } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { APP_ERROR_CODES, type CommandResult } from './types';

export type AppBuildOptions = {
  appPath: string;
  createWatchers?: boolean;
};

export type BuiltFileInfo = {
  checksum: string;
  builtPath: string;
  sourcePath: string;
  fileFolder: FileFolder;
};

export type AppBuildResult = {
  manifest: Manifest;
  filePaths: EntityFilePaths;
  builtFileInfos: Map<string, BuiltFileInfo>;
  logicFunctionsWatcher: EsbuildWatcher | null;
  frontComponentsWatcher: EsbuildWatcher | null;
};

export const appBuild = async (
  options: AppBuildOptions,
): Promise<CommandResult<AppBuildResult>> => {
  const buildResult = await buildManifest(options.appPath);

  if (buildResult.errors.length > 0 || !buildResult.manifest) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.MANIFEST_BUILD_FAILED,
        message: buildResult.errors.join('\n') || 'Failed to build manifest.',
      },
    };
  }

  const validation = manifestValidate(buildResult.manifest);

  if (!validation.isValid) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.MANIFEST_BUILD_FAILED,
        message: validation.errors.join('\n'),
      },
    };
  }

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

  const { logicFunctions, frontComponents } = buildResult.filePaths;

  const logicFunctionsWatcher = await buildLogicFunctions({
    appPath: options.appPath,
    sourcePaths: logicFunctions,
    onFileBuilt: collectFileBuilt,
    createWatcher: options.createWatchers,
  });

  const frontComponentsWatcher = await buildFrontComponents({
    appPath: options.appPath,
    sourcePaths: frontComponents,
    onFileBuilt: collectFileBuilt,
    createWatcher: options.createWatchers,
  });

  await copyStaticFiles({
    appPath: options.appPath,
    fileFolder: FileFolder.PublicAsset,
    filePaths: buildResult.filePaths.publicAssets,
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

  return {
    success: true,
    data: {
      manifest: buildResult.manifest,
      filePaths: buildResult.filePaths,
      builtFileInfos,
      logicFunctionsWatcher,
      frontComponentsWatcher,
    },
  };
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
