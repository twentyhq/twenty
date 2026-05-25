import crypto from 'crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'path';
import {
  NODE_ESM_CJS_BANNER,
  OUTPUT_DIR,
  type Manifest,
} from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';

import { esbuildOneShotBuild } from '@/cli/utilities/build/common/esbuild-one-shot-build';
import { LOGIC_FUNCTION_EXTERNAL_MODULES } from '@/cli/utilities/build/common/esbuild-watcher';
import { getBaseFrontComponentBuildOptions } from '@/cli/utilities/build/common/front-component-build/utils/get-base-front-component-build-options';
import { getFrontComponentBuildPlugins } from '@/cli/utilities/build/common/front-component-build/utils/get-front-component-build-plugins';
import { createStubTwentySdkDefinePlugin } from '@/cli/utilities/build/common/plugins/stub-twenty-sdk-define.plugin';
import { type OnFileBuiltCallback } from '@/cli/utilities/build/common/restartable-watcher-interface';
import { type EntityFilePaths } from '@/cli/utilities/build/manifest/manifest-extract-config';
import {
  copy,
  emptyDir,
  ensureDir,
  pathExists,
  pathExistsSync,
} from '@/cli/utilities/file/fs-utils';

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
  usesSdkClient?: boolean;
};

export type AppBuildResult = {
  builtFileInfos: Map<string, BuiltFileInfo>;
};

export const buildApplication = async (
  options: AppBuildOptions,
): Promise<AppBuildResult> => {
  const outputDir = join(options.appPath, OUTPUT_DIR);

  await ensureDir(outputDir);
  await emptyDir(outputDir);

  const builtFileInfos = new Map<string, BuiltFileInfo>();

  const collectFileBuilt: OnFileBuiltCallback = (event) => {
    builtFileInfos.set(event.builtPath, {
      checksum: event.checksum,
      builtPath: event.builtPath,
      sourcePath: event.sourcePath,
      fileFolder: event.fileFolder,
      usesSdkClient: event.usesSdkClient,
    });
  };

  const { logicFunctions, frontComponents } = options.filePaths;

  await esbuildOneShotBuild({
    appPath: options.appPath,
    sourcePaths: logicFunctions,
    fileFolder: FileFolder.BuiltLogicFunction,
    buildOptions: {
      bundle: true,
      splitting: false,
      format: 'esm',
      platform: 'node',
      outdir: join(options.appPath, OUTPUT_DIR),
      outExtension: { '.js': '.mjs' },
      external: LOGIC_FUNCTION_EXTERNAL_MODULES,
      tsconfig: join(options.appPath, 'tsconfig.json'),
      sourcemap: true,
      metafile: true,
      logLevel: 'silent',
      banner: NODE_ESM_CJS_BANNER,
      plugins: [createStubTwentySdkDefinePlugin()],
    },
    onFileBuilt: collectFileBuilt,
  });

  await esbuildOneShotBuild({
    appPath: options.appPath,
    sourcePaths: frontComponents,
    fileFolder: FileFolder.BuiltFrontComponent,
    buildOptions: {
      ...getBaseFrontComponentBuildOptions(),
      outdir: join(options.appPath, OUTPUT_DIR),
      tsconfig: join(options.appPath, 'tsconfig.json'),
      jsx: 'automatic',
      sourcemap: true,
      metafile: true,
      logLevel: 'silent',
      plugins: [
        ...getFrontComponentBuildPlugins(),
        createStubTwentySdkDefinePlugin(),
      ],
    },
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
      pathExistsSync(join(options.appPath, filePath)),
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

    if (!(await pathExists(absoluteSourcePath))) {
      continue;
    }

    const builtPath = join(OUTPUT_DIR, sourcePath);
    const absoluteBuiltPath = join(appPath, builtPath);

    await ensureDir(dirname(absoluteBuiltPath));
    await copy(absoluteSourcePath, absoluteBuiltPath);

    const content = await readFile(absoluteBuiltPath);
    const checksum = crypto.createHash('md5').update(content).digest('hex');

    collectFileBuilt({
      fileFolder,
      builtPath,
      sourcePath,
      checksum,
    });
  }
};
