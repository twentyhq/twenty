import chalk from 'chalk';
import * as fs from 'fs-extra';
import path from 'path';
import type { ApplicationManifest } from 'twenty-shared/application';
import { build, type InlineConfig, type Rollup } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { GENERATED_DIR, OUTPUT_DIR } from '../common/constants';
import { printWatchingMessage } from '../common/display';
import { FUNCTIONS_DIR } from './constants';
import { buildFunctionInput } from './function-paths';

export const FUNCTION_EXTERNAL_MODULES: (string | RegExp)[] = [
  'path', 'fs', 'crypto', 'stream', 'util', 'os', 'url', 'http', 'https',
  'events', 'buffer', 'querystring', 'assert', 'zlib', 'net', 'tls',
  'child_process', 'worker_threads',
  /^twenty-sdk/, /^twenty-shared/, /^@\//, /(?:^|\/)generated(?:\/|$)/,
];

export type FunctionsWatcherCallbacks = {
  onBuildSuccess?: () => void;
  onBuildError?: (error: Error) => void;
};

export type FunctionsWatcherOptions = {
  appPath: string;
  manifest: ApplicationManifest | null;
  callbacks?: FunctionsWatcherCallbacks;
  plugins?: InlineConfig['plugins'];
};

export type FunctionsWatcher = {
  close: () => Promise<void>;
  restart: (manifest: ApplicationManifest) => Promise<void>;
};

type FunctionWatcherConfigOptions = {
  appPath: string;
  functionInput: Record<string, string>;
  plugins?: InlineConfig['plugins'];
};

const createFunctionWatcherConfig = (options: FunctionWatcherConfigOptions): InlineConfig => {
  const { appPath, functionInput, plugins = [] } = options;

  const outputDir = path.join(appPath, OUTPUT_DIR);
  const functionsOutputDir = path.join(outputDir, FUNCTIONS_DIR);
  const hasFunctions = Object.keys(functionInput).length > 0;

  const entry = hasFunctions
    ? functionInput
    : { __placeholder__: path.join(appPath, 'src/app/application.config.ts') };

  return {
    root: appPath,
    plugins: [
      tsconfigPaths({ root: appPath }),
      ...plugins,
    ],
    build: {
      outDir: functionsOutputDir,
      emptyOutDir: false,
      watch: {
        include: ['src/**/*.ts', 'src/**/*.json'],
        exclude: ['node_modules/**', '.twenty/**', 'dist/**'],
      },
      lib: {
        entry,
        formats: ['es'],
        fileName: (_, entryName) => `${entryName}.js`,
      },
      rollupOptions: {
        external: hasFunctions ? FUNCTION_EXTERNAL_MODULES : [/.*/],
        treeshake: hasFunctions,
        output: {
          preserveModules: false,
          exports: 'named',
          paths: (id: string) => {
            if (/(?:^|\/)generated(?:\/|$)/.test(id)) {
              return `../${GENERATED_DIR}/index.js`;
            }
            return id;
          },
        },
      },
      minify: false,
      sourcemap: hasFunctions,
    },
    logLevel: 'silent',
    configFile: false,
  };
};

export const createFunctionsWatcher = async (
  options: FunctionsWatcherOptions,
): Promise<FunctionsWatcher> => {
  const { appPath, callbacks = {}, plugins } = options;
  let functionInput = buildFunctionInput(appPath, options.manifest?.serverlessFunctions ?? []);
  let isRestarting = false;

  const outputDir = path.join(appPath, OUTPUT_DIR, FUNCTIONS_DIR);
  await fs.ensureDir(outputDir);

  const startWatcher = async (): Promise<Rollup.RollupWatcher> => {
    const hasFunctions = Object.keys(functionInput).length > 0;

    if (hasFunctions) {
      console.log(chalk.blue('  📦 Building functions...'));
    } else {
      console.log(chalk.gray('  No functions to build'));
    }

    const config = createFunctionWatcherConfig({ appPath, functionInput, plugins });
    const watcher = await build(config) as Rollup.RollupWatcher;

    watcher.on('event', (event) => {
      if (event.code === 'END') {
        if (hasFunctions) {
          console.log(chalk.green('  ✓ Functions built'));
        }
        printWatchingMessage();
        callbacks.onBuildSuccess?.();
      } else if (event.code === 'ERROR') {
        console.error(chalk.red('  ✗ Function build error:'), event.error?.message);
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
        console.log(chalk.yellow('🔄 Restarting functions watcher...'));
        await innerWatcher.close();
        functionInput = buildFunctionInput(appPath, manifest.serverlessFunctions);
        innerWatcher = await startWatcher();
        console.log(chalk.green('✓ Functions watcher restarted'));
      } finally {
        isRestarting = false;
      }
    },
  };
};
