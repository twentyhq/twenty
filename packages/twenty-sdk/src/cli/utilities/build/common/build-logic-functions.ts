import { esbuildOneShotBuild } from '@/cli/utilities/build/common/esbuild-one-shot-build';
import {
  createLogicFunctionsWatcher,
  createSdkGeneratedResolverPlugin,
  type EsbuildWatcher,
  LOGIC_FUNCTION_EXTERNAL_MODULES,
} from '@/cli/utilities/build/common/esbuild-watcher';
import {
  type BuildEntityFilesOptions,
  startWatcher,
} from '@/cli/utilities/build/common/start-watcher';
import { join } from 'path';
import { NODE_ESM_CJS_BANNER, OUTPUT_DIR } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';

export const buildLogicFunctions = async ({
  appPath,
  sourcePaths,
  onFileBuilt,
  watcherCallbacks,
}: BuildEntityFilesOptions): Promise<EsbuildWatcher | null> => {
  if (watcherCallbacks) {
    return startWatcher({
      appPath,
      sourcePaths,
      watcherCallbacks,
      watcherFactory: createLogicFunctionsWatcher,
    });
  }

  await esbuildOneShotBuild({
    appPath,
    sourcePaths,
    fileFolder: FileFolder.BuiltLogicFunction,
    buildOptions: {
      bundle: true,
      splitting: false,
      format: 'esm',
      platform: 'node',
      outdir: join(appPath, OUTPUT_DIR),
      outExtension: { '.js': '.mjs' },
      external: LOGIC_FUNCTION_EXTERNAL_MODULES,
      tsconfig: join(appPath, 'tsconfig.json'),
      sourcemap: true,
      metafile: true,
      logLevel: 'silent',
      banner: NODE_ESM_CJS_BANNER,
      plugins: [createSdkGeneratedResolverPlugin(appPath)],
    },
    onFileBuilt,
  });

  return null;
};
