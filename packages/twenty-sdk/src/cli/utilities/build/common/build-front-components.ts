import { esbuildOneShotBuild } from '@/cli/utilities/build/common/esbuild-one-shot-build';
import {
  createSdkGeneratedResolverPlugin,
} from '@/cli/utilities/build/common/esbuild-watcher';
import { FRONT_COMPONENT_EXTERNAL_MODULES } from '@/cli/utilities/build/common/front-component-build/constants/front-component-external-modules';
import { getFrontComponentBuildPlugins } from '@/cli/utilities/build/common/front-component-build/utils/get-front-component-build-plugins';
import { type OnFileBuiltCallback } from '@/cli/utilities/build/common/restartable-watcher-interface';
import { join } from 'path';
import { OUTPUT_DIR } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';

export type BuildFrontComponentsOptions = {
  appPath: string;
  sourcePaths: string[];
  onFileBuilt: OnFileBuiltCallback;
};

export const buildFrontComponents = async ({
  appPath,
  sourcePaths,
  onFileBuilt,
}: BuildFrontComponentsOptions): Promise<void> => {
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
};
