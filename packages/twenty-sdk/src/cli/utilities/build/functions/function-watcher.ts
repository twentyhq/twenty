import chalk from 'chalk';
import * as fs from 'fs-extra';
import path from 'path';
import type { ApplicationManifest } from 'twenty-shared/application';
import { build, type InlineConfig, type Rollup } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { GENERATED_DIR, OUTPUT_DIR } from '../common/constants';
import { printWatchingMessage } from '../common/display';
import {
  type RestartableWatcher,
  type RestartableWatcherOptions,
} from '../common/restartable-watcher.interface';
import { FUNCTIONS_DIR } from './constants';
import { computeFunctionOutputPath } from './function-paths';

const buildFunctionEntries = (
  appPath: string,
  handlerPaths: Array<{ handlerPath: string }>,
): Record<string, string> => {
  const entries: Record<string, string> = {};

  for (const fn of handlerPaths) {
    const { relativePath } = computeFunctionOutputPath(fn.handlerPath);
    const chunkName = relativePath.replace(/\.js$/, '');
    entries[chunkName] = path.join(appPath, fn.handlerPath);
  }

  return entries;
};

export const FUNCTION_EXTERNAL_MODULES: (string | RegExp)[] = [
  'path', 'fs', 'crypto', 'stream', 'util', 'os', 'url', 'http', 'https',
  'events', 'buffer', 'querystring', 'assert', 'zlib', 'net', 'tls',
  'child_process', 'worker_threads',
  /^twenty-sdk/, /^twenty-shared/, /^@\//, /(?:^|\/)generated(?:\/|$)/,
];

export class FunctionsWatcher implements RestartableWatcher {
  private appPath: string;
  private entries: Record<string, string>;
  private innerWatcher: Rollup.RollupWatcher | null = null;
  private isRestarting = false;

  constructor(options: RestartableWatcherOptions) {
    this.appPath = options.appPath;
    this.entries = buildFunctionEntries(
      options.appPath,
      options.manifest?.serverlessFunctions ?? [],
    );
  }

  shouldRestart(manifest: ApplicationManifest): boolean {
    const newEntries = buildFunctionEntries(this.appPath, manifest.serverlessFunctions);
    const currentKeys = Object.keys(this.entries).sort();
    const newKeys = Object.keys(newEntries).sort();

    if (currentKeys.length !== newKeys.length) {
      return true;
    }

    for (let i = 0; i < currentKeys.length; i++) {
      if (currentKeys[i] !== newKeys[i]) {
        return true;
      }
    }

    return false;
  }

  async start(): Promise<void> {
    const outputDir = path.join(this.appPath, OUTPUT_DIR, FUNCTIONS_DIR);
    await fs.ensureDir(outputDir);

    if (this.hasEntries()) {
      console.log(chalk.blue('  📦 Building functions...'));
      this.innerWatcher = await this.createWatcher();
    } else {
      console.log(chalk.gray('  No functions to build'));
      printWatchingMessage();
    }
  }

  async close(): Promise<void> {
    await this.innerWatcher?.close();
  }

  async restart(manifest: ApplicationManifest): Promise<void> {
    if (this.isRestarting) {
      return;
    }

    this.isRestarting = true;

    try {
      console.log(chalk.yellow('🔄 Restarting functions watcher...'));
      await this.innerWatcher?.close();
      this.innerWatcher = null;

      this.entries = buildFunctionEntries(this.appPath, manifest.serverlessFunctions);

      if (this.hasEntries()) {
        console.log(chalk.blue('  📦 Building functions...'));
        this.innerWatcher = await this.createWatcher();
      } else {
        console.log(chalk.gray('  No functions to build'));
        printWatchingMessage();
      }

      console.log(chalk.green('✓ Functions watcher restarted'));
    } finally {
      this.isRestarting = false;
    }
  }

  private hasEntries(): boolean {
    return Object.keys(this.entries).length > 0;
  }

  private async createWatcher(): Promise<Rollup.RollupWatcher> {
    const config = this.createConfig();
    const watcher = await build(config) as Rollup.RollupWatcher;

    watcher.on('event', (event) => {
      if (event.code === 'END') {
        console.log(chalk.green('  ✓ Functions built'));
        printWatchingMessage();
      } else if (event.code === 'ERROR') {
        console.error(chalk.red('  ✗ Function build error:'), event.error?.message);
      }
    });

    return watcher;
  }

  private createConfig(): InlineConfig {
    const functionsOutputDir = path.join(this.appPath, OUTPUT_DIR, FUNCTIONS_DIR);

    return {
      root: this.appPath,
      plugins: [
        tsconfigPaths({ root: this.appPath }),
      ],
      build: {
        outDir: functionsOutputDir,
        emptyOutDir: false,
        watch: {
          include: ['src/**/*.ts', 'src/**/*.json'],
          exclude: ['node_modules/**', '.twenty/**', 'dist/**'],
        },
        lib: {
          entry: this.entries,
          formats: ['es'],
          fileName: (_, entryName) => `${entryName}.js`,
        },
        rollupOptions: {
          external: FUNCTION_EXTERNAL_MODULES,
          treeshake: true,
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
        sourcemap: true,
      },
      logLevel: 'silent',
      configFile: false,
    };
  }
}
