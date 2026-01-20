import chalk from 'chalk';
import * as fs from 'fs-extra';
import path from 'path';
import type { ApplicationManifest, FrontComponentManifest } from 'twenty-shared/application';
import { build, type InlineConfig, type Rollup } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { OUTPUT_DIR } from '../common/constants';
import { printWatchingMessage } from '../common/display';
import { FRONT_COMPONENTS_DIR } from './constants';

export const FRONT_COMPONENT_EXTERNAL_MODULES: (string | RegExp)[] = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
];

const computeOutputPath = (sourcePath: string): string => {
  const normalizedPath = sourcePath.replace(/\\/g, '/');

  let relativePath = normalizedPath;
  if (relativePath.startsWith('src/app/')) {
    relativePath = relativePath.slice('src/app/'.length);
  } else if (relativePath.startsWith('src/')) {
    relativePath = relativePath.slice('src/'.length);
  }

  return relativePath.replace(/\.tsx?$/, '.js');
};

const buildFrontComponentInput = (
  appPath: string,
  components: FrontComponentManifest[],
): Record<string, string> => {
  const input: Record<string, string> = {};

  for (const component of components) {
    const relativePath = computeOutputPath(component.componentPath);
    const chunkName = relativePath.replace(/\.js$/, '');
    input[chunkName] = path.join(appPath, component.componentPath);
  }

  return input;
};

export type FrontComponentsWatcherCallbacks = {
  onBuildSuccess?: () => void;
  onBuildError?: (error: Error) => void;
};

export type FrontComponentsWatcherOptions = {
  appPath: string;
  manifest: ApplicationManifest | null;
  callbacks?: FrontComponentsWatcherCallbacks;
  plugins?: InlineConfig['plugins'];
};

export type FrontComponentsWatcher = {
  close: () => Promise<void>;
  restart: (manifest: ApplicationManifest) => Promise<void>;
};

type FrontComponentWatcherConfigOptions = {
  appPath: string;
  componentInput: Record<string, string>;
  plugins?: InlineConfig['plugins'];
};

const createFrontComponentWatcherConfig = (options: FrontComponentWatcherConfigOptions): InlineConfig => {
  const { appPath, componentInput, plugins = [] } = options;

  const outputDir = path.join(appPath, OUTPUT_DIR);
  const frontComponentsOutputDir = path.join(outputDir, FRONT_COMPONENTS_DIR);
  const hasComponents = Object.keys(componentInput).length > 0;

  const entry = hasComponents
    ? componentInput
    : { __placeholder__: path.join(appPath, 'src/app/application.config.ts') };

  return {
    root: appPath,
    plugins: [
      tsconfigPaths({ root: appPath }),
      ...plugins,
    ],
    esbuild: {
      jsx: 'automatic',
    },
    build: {
      outDir: frontComponentsOutputDir,
      emptyOutDir: false,
      watch: {
        include: ['src/**/*.tsx', 'src/**/*.ts', 'src/**/*.json'],
        exclude: ['node_modules/**', '.twenty/**', 'dist/**'],
      },
      lib: {
        entry,
        formats: ['es'],
        fileName: (_, entryName) => `${entryName}.js`,
      },
      rollupOptions: {
        external: hasComponents ? FRONT_COMPONENT_EXTERNAL_MODULES : [/.*/],
        treeshake: hasComponents,
        output: {
          preserveModules: false,
          exports: 'named',
        },
      },
      minify: false,
      sourcemap: hasComponents,
    },
    logLevel: 'silent',
    configFile: false,
  };
};

export const createFrontComponentsWatcher = async (
  options: FrontComponentsWatcherOptions,
): Promise<FrontComponentsWatcher> => {
  const { appPath, callbacks = {}, plugins } = options;
  let componentInput = buildFrontComponentInput(appPath, options.manifest?.frontComponents ?? []);
  let isRestarting = false;

  const outputDir = path.join(appPath, OUTPUT_DIR, FRONT_COMPONENTS_DIR);
  await fs.ensureDir(outputDir);

  const startWatcher = async (): Promise<Rollup.RollupWatcher> => {
    const hasComponents = Object.keys(componentInput).length > 0;

    if (hasComponents) {
      console.log(chalk.blue('  🎨 Building front components...'));
    } else {
      console.log(chalk.gray('  No front components to build'));
    }

    const config = createFrontComponentWatcherConfig({ appPath, componentInput, plugins });
    const watcher = await build(config) as Rollup.RollupWatcher;

    watcher.on('event', (event) => {
      if (event.code === 'END') {
        if (hasComponents) {
          console.log(chalk.green('  ✓ Front components built'));
        }
        printWatchingMessage();
        callbacks.onBuildSuccess?.();
      } else if (event.code === 'ERROR') {
        console.error(chalk.red('  ✗ Front component build error:'), event.error?.message);
        callbacks.onBuildError?.(event.error);
      }
    });

    return watcher;
  };

  let innerWatcher = await startWatcher();

  return {
    close: async () => {
      await innerWatcher.close();
    },
    restart: async (manifest: ApplicationManifest) => {
      if (isRestarting) {
        return;
      }

      isRestarting = true;

      try {
        console.log(chalk.yellow('🔄 Restarting front components watcher...'));
        await innerWatcher.close();
        componentInput = buildFrontComponentInput(appPath, manifest.frontComponents ?? []);
        innerWatcher = await startWatcher();
        console.log(chalk.green('✓ Front components watcher restarted'));
      } finally {
        isRestarting = false;
      }
    },
  };
};
