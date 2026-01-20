import chalk from 'chalk';
import * as fs from 'fs-extra';
import path from 'path';
import { type ApplicationManifest } from 'twenty-shared/application';
import { build, type InlineConfig, type Plugin, type Rollup } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { OUTPUT_DIR } from '../common/constants';
import { printWatchingMessage } from '../common/display';
import { runManifestBuild } from './manifest-build';

export type ManifestWatcherCallbacks = {
  onBuildSuccess?: (manifest: ApplicationManifest) => void;
};

export type ManifestWatcher = {
  close: () => Promise<void>;
};

export type ManifestWatcherOptions = {
  appPath: string;
  callbacks?: ManifestWatcherCallbacks;
  plugins?: InlineConfig['plugins'];
};

const createManifestBuildPlugin = (
  appPath: string,
  callbacks: ManifestWatcherCallbacks,
): Plugin => {
  let isFirstBuild = true;

  return {
    name: 'manifest-build-plugin',
    async writeBundle() {
      if (isFirstBuild) {
        isFirstBuild = false;
        return;
      }

      const manifest = await runManifestBuild(appPath);

      if (manifest) {
        printWatchingMessage();
        callbacks.onBuildSuccess?.(manifest);
      }
    },
  };
};

const createManifestWatcherConfig = (
  appPath: string,
  callbacks: ManifestWatcherCallbacks,
  plugins: InlineConfig['plugins'] = [],
): InlineConfig => {
  const outputDir = path.join(appPath, OUTPUT_DIR, 'manifest-watcher-tmp');

  return {
    root: appPath,
    plugins: [
      tsconfigPaths({ root: appPath }),
      createManifestBuildPlugin(appPath, callbacks),
      ...plugins,
    ],
    build: {
      outDir: outputDir,
      emptyOutDir: true,
      watch: {
        include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.json'],
        exclude: ['node_modules/**', '.twenty/**', 'dist/**'],
      },
      lib: {
        entry: { __manifest_watch__: path.join(appPath, 'src/app/application.config.ts') },
        formats: ['es'],
        fileName: () => '__manifest_watch__.js',
      },
      rollupOptions: {
        external: [/.*/],
        treeshake: false,
      },
      minify: false,
      sourcemap: false,
    },
    logLevel: 'silent',
    configFile: false,
  };
};

export const createManifestWatcher = async (
  options: ManifestWatcherOptions,
): Promise<ManifestWatcher> => {
  const { appPath, callbacks = {}, plugins } = options;

  const config = createManifestWatcherConfig(appPath, callbacks, plugins);
  const watcher = await build(config) as Rollup.RollupWatcher;

  watcher.on('event', (event) => {
    if (event.code === 'ERROR') {
      console.error(chalk.red('  ✗ Manifest watcher error:'), event.error?.message);
    }
  });

  console.log(chalk.gray('  📂 Manifest watcher started'));

  return {
    close: async () => {
      await watcher.close();
      const tmpDir = path.join(appPath, OUTPUT_DIR, 'manifest-watcher-tmp');
      await fs.remove(tmpDir);
    },
  };
};
