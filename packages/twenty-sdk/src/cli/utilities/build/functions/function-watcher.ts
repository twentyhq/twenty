import chalk from 'chalk';
import * as fs from 'fs-extra';
import path from 'path';
import { build, type InlineConfig, type Rollup } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { cleanupRemovedFiles } from '../common/cleanup-removed-files';
import { OUTPUT_DIR } from '../common/constants';
import { printWatchingMessage } from '../common/display';
import {
  type RestartableWatcher,
  type RestartableWatcherOptions,
} from '../common/restartable-watcher.interface';
import { type ManifestBuildResult } from '../manifest/manifest-build';
import { FUNCTIONS_DIR } from './constants';

export const FUNCTION_EXTERNAL_MODULES: (string | RegExp)[] = [
  'path', 'fs', 'crypto', 'stream', 'util', 'os', 'url', 'http', 'https',
  'events', 'buffer', 'querystring', 'assert', 'zlib', 'net', 'tls',
  'child_process', 'worker_threads',
  /^twenty-sdk/, /^twenty-shared/, /^@\//, /(?:^|\/)generated(?:\/|$)/,
];

export class FunctionsWatcher implements RestartableWatcher {
  private appPath: string;
  private functionPaths: string[];
  private innerWatchers: Rollup.RollupWatcher[] = [];
  private isRestarting = false;

  constructor(options: RestartableWatcherOptions) {
    this.appPath = options.appPath;
    this.functionPaths = options.buildResult?.filePaths.functions ?? [];
  }

  shouldRestart(result: ManifestBuildResult): boolean {
    const currentPaths = this.functionPaths.sort().join(',');
    const newPaths = result.filePaths.functions.sort().join(',');

    return currentPaths !== newPaths;
  }

  async start(): Promise<void> {
    const outputDir = path.join(this.appPath, OUTPUT_DIR, FUNCTIONS_DIR);
    await fs.emptyDir(outputDir);

    if (this.functionPaths.length > 0) {
      console.log(chalk.blue('  📦 Building functions...'));
      this.innerWatchers = await this.createWatchers();
    } else {
      console.log(chalk.gray('  No functions to build'));
      printWatchingMessage();
    }
  }

  async close(): Promise<void> {
    await Promise.all(this.innerWatchers.map((w) => w.close()));
    this.innerWatchers = [];
  }

  async restart(result: ManifestBuildResult): Promise<void> {
    if (this.isRestarting) return;

    this.isRestarting = true;
    try {
      console.log(chalk.yellow('🔄 Restarting functions watcher...'));
      await this.close();

      const outputDir = path.join(this.appPath, OUTPUT_DIR, FUNCTIONS_DIR);
      const newPaths = result.filePaths.functions;
      await cleanupRemovedFiles(outputDir, this.functionPaths, newPaths);
      this.functionPaths = newPaths;

      if (this.functionPaths.length > 0) {
        console.log(chalk.blue('  📦 Building functions...'));
        this.innerWatchers = await this.createWatchers();
      } else {
        console.log(chalk.gray('  No functions to build'));
        printWatchingMessage();
      }

      console.log(chalk.green('✓ Functions watcher restarted'));
    } finally {
      this.isRestarting = false;
    }
  }

  // Build each function separately to ensure self-contained bundles (no shared chunks)
  private async createWatchers(): Promise<Rollup.RollupWatcher[]> {
    let completedCount = 0;
    const totalCount = this.functionPaths.length;

    const watchers = await Promise.all(
      this.functionPaths.map(async (functionPath) => {
        const config = this.createConfig(functionPath);
        const watcher = (await build(config)) as Rollup.RollupWatcher;

        watcher.on('event', (event) => {
          if (event.code === 'END') {
            completedCount++;
            if (completedCount >= totalCount) {
              console.log(chalk.green('  ✓ Functions built'));
              printWatchingMessage();
              completedCount = 0;
            }
          } else if (event.code === 'ERROR') {
            console.error(
              chalk.red('  ✗ Function build error:'),
              event.error?.message,
            );
          }
        });

        return watcher;
      }),
    );

    return watchers;
  }

  private createConfig(functionPath: string): InlineConfig {
    const functionsOutputDir = path.join(this.appPath, OUTPUT_DIR, FUNCTIONS_DIR);
    const entryName = functionPath.replace(/\.tsx?$/, '');

    return {
      root: this.appPath,
      plugins: [tsconfigPaths({ root: this.appPath })],
      build: {
        outDir: functionsOutputDir,
        emptyOutDir: false,
        watch: {
          include: ['**/*.ts', '**/*.tsx', '**/*.json'],
          exclude: ['node_modules/**', '.twenty/**', 'dist/**'],
        },
        lib: {
          entry: path.join(this.appPath, functionPath),
          formats: ['es'],
          fileName: () => `${entryName}.mjs`,
        },
        rollupOptions: {
          external: FUNCTION_EXTERNAL_MODULES,
          treeshake: true,
        },
        minify: false,
        sourcemap: true,
      },
      logLevel: 'silent',
      configFile: false,
    };
  }
}
