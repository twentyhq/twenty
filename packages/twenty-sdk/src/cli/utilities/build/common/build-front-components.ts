import { esbuildOneShotBuild } from '@/cli/utilities/build/common/esbuild-one-shot-build';
import {
  createFrontComponentsWatcher,
  createSdkGeneratedResolverPlugin,
  type EsbuildWatcher,
} from '@/cli/utilities/build/common/esbuild-watcher';
import { FRONT_COMPONENT_EXTERNAL_MODULES } from '@/cli/utilities/build/common/front-component-build/constants/front-component-external-modules';
import { getFrontComponentBuildPlugins } from '@/cli/utilities/build/common/front-component-build/utils/get-front-component-build-plugins';
import {
  type BuildEntityFilesOptions,
  startWatcher,
} from '@/cli/utilities/build/common/start-watcher';
import { join } from 'path';
import { OUTPUT_DIR } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';

export const buildFrontComponents = async ({
  appPath,
  sourcePaths,
  onFileBuilt,
  createWatcher,
}: BuildEntityFilesOptions): Promise<EsbuildWatcher | null> => {
  if (createWatcher) {
    return startWatcher({
      appPath,
      sourcePaths,
      onFileBuilt,
      watcherFactory: createFrontComponentsWatcher,
    });
  }

  await esbuildOneShotBuild({
    appPath,
    sourcePaths,
    fileFolder: FileFolder.BuiltFrontComponent,
    buildOptions: {
      bundle: true,
      splitting: false,
      format: 'esm',
      outdir: join(appPath, OUTPUT_DIR),
      outExtension: { '.js': '.mjs' },
      external: FRONT_COMPONENT_EXTERNAL_MODULES,
      tsconfig: join(appPath, 'tsconfig.json'),
      jsx: 'automatic',
      sourcemap: true,
      metafile: true,
      logLevel: 'silent',
      plugins: [
        createSdkGeneratedResolverPlugin(appPath),
        ...getFrontComponentBuildPlugins(),
      ],
    },
    onFileBuilt,
  });

  return null;
};
