import { recordWatchFile } from '@/app/dev/collect-watch-inputs';
import crypto from 'crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'path';
import {
  NODE_ESM_CJS_BANNER,
  OUTPUT_DIR,
  type Manifest,
} from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { copyBuildFile } from '@/app/bundles/copy-build-file';
import { copyReadmeToOutput } from '@/app/bundles/copy-readme-to-output';
import { type GeneratedAsset } from '@/app/bundles/cover/generated-asset.type';
import { esbuildOneShotBuild } from '@/app/bundles/esbuild-one-shot-build';
import { LOGIC_FUNCTION_EXTERNAL_MODULES } from '@/app/bundles/constants/logic-function-external-modules';
import { getBaseFrontComponentBuildOptions } from '@/app/bundles/front-component-build/utils/get-base-front-component-build-options';
import { getFrontComponentBuildPlugins } from '@/app/bundles/front-component-build/utils/get-front-component-build-plugins';
import { createStubTwentySdkDefinePlugin } from '@/app/bundles/plugins/stub-twenty-sdk-define.plugin';
import { type OnFileBuiltCallback } from '@/app/bundles/types/on-file-built-callback.type';
import { buildSharedDependenciesBundle } from '@/app/bundles/front-component-build/shared-dependencies-build/build-shared-dependencies-bundle';
import { type SharedDependenciesBuildContext } from '@/app/bundles/front-component-build/shared-dependencies-build/types/shared-dependencies-build-context.type';
import { type EntityFilePaths } from '@/app/manifest/types/entity-file-paths.type';
import { loadFrontComponentTranslationCatalogs } from '@/app/translations/load-front-component-translation-catalogs';
import {
  emptyDir,
  ensureDir,
  pathExists,
  pathExistsSync,
} from '@/app/fs-utils';
import { FRONT_COMPONENT_TRANSLATIONS_KEY } from '@/app/bundles/constants/front-component-translations-key';

export type AppBuildOptions = {
  appPath: string;
  manifest: Manifest;
  filePaths: EntityFilePaths;
  generatedAssets?: GeneratedAsset[];
  outputDir?: string;
  dereferenceSymlinks?: boolean;
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
  const relativeOutputDir = options.outputDir ?? OUTPUT_DIR;
  const outputDir = join(options.appPath, relativeOutputDir);

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
  const sharedDependencies =
    options.manifest.application.frontComponentSharedDependencies;

  const frontComponentTranslationCatalogs =
    await loadFrontComponentTranslationCatalogs(options.appPath);

  const frontComponentTranslationsBanner = Object.keys(
    frontComponentTranslationCatalogs,
  ).length
    ? {
        js: `globalThis[${JSON.stringify(FRONT_COMPONENT_TRANSLATIONS_KEY)}]=${JSON.stringify(
          frontComponentTranslationCatalogs,
        )};`,
      }
    : undefined;

  await esbuildOneShotBuild({
    appPath: options.appPath,
    sourcePaths: logicFunctions,
    fileFolder: FileFolder.BuiltLogicFunction,
    buildOptions: {
      bundle: true,
      splitting: false,
      format: 'esm',
      platform: 'node',
      outdir: outputDir,
      outExtension: { '.js': '.mjs' },
      external: LOGIC_FUNCTION_EXTERNAL_MODULES,
      tsconfig: join(options.appPath, 'tsconfig.json'),
      sourcemap: true,
      metafile: true,
      logLevel: 'silent',
      banner: NODE_ESM_CJS_BANNER,
      plugins: [createStubTwentySdkDefinePlugin(options.appPath)],
    },
    onFileBuilt: collectFileBuilt,
  });

  const sharedDependenciesBuildContext: SharedDependenciesBuildContext | null =
    isDefined(sharedDependencies)
      ? await buildSharedDependenciesBundle({
          appPath: options.appPath,
          outputDir: relativeOutputDir,
          sharedDependencies,
          onFileBuilt: collectFileBuilt,
        })
      : null;

  await esbuildOneShotBuild({
    appPath: options.appPath,
    sourcePaths: frontComponents,
    fileFolder: FileFolder.BuiltFrontComponent,
    buildOptions: {
      ...getBaseFrontComponentBuildOptions(),
      outdir: outputDir,
      tsconfig: join(options.appPath, 'tsconfig.json'),
      jsx: 'automatic',
      sourcemap: true,
      metafile: true,
      logLevel: 'silent',
      ...(frontComponentTranslationsBanner !== undefined
        ? { banner: frontComponentTranslationsBanner }
        : {}),
      plugins: [
        ...getFrontComponentBuildPlugins({
          getSharedDependenciesBuildContext: () =>
            sharedDependenciesBuildContext,
        }),
        createStubTwentySdkDefinePlugin(options.appPath),
      ],
    },
    onFileBuilt: collectFileBuilt,
  });

  await copyStaticFiles({
    appPath: options.appPath,
    fileFolder: FileFolder.Source,
    filePaths: [...new Set([...logicFunctions, ...frontComponents])],
    collectFileBuilt,
    outputDir: relativeOutputDir,
    dereferenceSymlinks: options.dereferenceSymlinks,
  });

  await copyStaticFiles({
    appPath: options.appPath,
    fileFolder: FileFolder.PublicAsset,
    filePaths: options.filePaths.publicAssets,
    collectFileBuilt,
    outputDir: relativeOutputDir,
    dereferenceSymlinks: options.dereferenceSymlinks,
  });

  await copyStaticFiles({
    appPath: options.appPath,
    fileFolder: FileFolder.Dependencies,
    filePaths: ['package.json', 'yarn.lock'].filter((filePath) =>
      pathExistsSync(join(options.appPath, filePath)),
    ),
    collectFileBuilt,
    outputDir: relativeOutputDir,
    dereferenceSymlinks: options.dereferenceSymlinks,
  });

  for (const generatedAsset of options.generatedAssets ?? []) {
    await writeGeneratedAsset({
      appPath: options.appPath,
      generatedAsset,
      outputDir: relativeOutputDir,
      collectFileBuilt,
    });
  }

  await copyReadmeToOutput({
    appPath: options.appPath,
    relativeOutputDir,
    dereferenceSymlinks: options.dereferenceSymlinks,
  });

  return { builtFileInfos };
};

const writeGeneratedAsset = async ({
  appPath,
  generatedAsset,
  outputDir,
  collectFileBuilt,
}: {
  appPath: string;
  generatedAsset: GeneratedAsset;
  outputDir: string;
  collectFileBuilt: OnFileBuiltCallback;
}) => {
  const builtPath = join(outputDir, generatedAsset.relativePath);
  const absoluteBuiltPath = join(appPath, builtPath);

  await ensureDir(dirname(absoluteBuiltPath));
  await writeFile(absoluteBuiltPath, generatedAsset.content);

  const checksum = crypto
    .createHash('md5')
    .update(generatedAsset.content)
    .digest('hex');

  await collectFileBuilt({
    fileFolder: FileFolder.PublicAsset,
    builtPath,
    sourcePath: generatedAsset.relativePath,
    checksum,
  });
};

const copyStaticFiles = async ({
  appPath,
  fileFolder,
  filePaths,
  outputDir,
  dereferenceSymlinks = false,
  collectFileBuilt,
}: {
  appPath: string;
  fileFolder: FileFolder;
  filePaths: string[];
  outputDir: string;
  dereferenceSymlinks?: boolean;
  collectFileBuilt: OnFileBuiltCallback;
}) => {
  for (const sourcePath of filePaths) {
    const absoluteSourcePath = join(appPath, sourcePath);
    recordWatchFile(absoluteSourcePath);

    if (!(await pathExists(absoluteSourcePath))) {
      continue;
    }

    const builtPath = join(outputDir, sourcePath);
    const absoluteBuiltPath = join(appPath, builtPath);

    await ensureDir(dirname(absoluteBuiltPath));
    await copyBuildFile({
      sourcePath: absoluteSourcePath,
      destinationPath: absoluteBuiltPath,
      dereferenceSymlinks,
    });

    const content = await readFile(absoluteBuiltPath);
    const checksum = crypto.createHash('md5').update(content).digest('hex');

    await collectFileBuilt({
      fileFolder,
      builtPath,
      sourcePath,
      checksum,
    });
  }
};
