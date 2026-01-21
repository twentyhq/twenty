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
  private innerWatcher: Rollup.RollupWatcher | null = null;
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
    await fs.ensureDir(outputDir);

    if (this.functionPaths.length > 0) {
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

  async restart(result: ManifestBuildResult): Promise<void> {
    if (this.isRestarting) {
      return;
    }

    this.isRestarting = true;

    try {
      console.log(chalk.yellow('🔄 Restarting functions watcher...'));
      await this.innerWatcher?.close();
      this.innerWatcher = null;

      const outputDir = path.join(this.appPath, OUTPUT_DIR, FUNCTIONS_DIR);
      const newPaths = result.filePaths.functions;
      await cleanupRemovedFiles(outputDir, this.functionPaths, newPaths);
      this.functionPaths = newPaths;

      if (this.functionPaths.length > 0) {
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

    const entries = Object.fromEntries(
      this.functionPaths.map((filePath) => [
        filePath.replace(/\.tsx?$/, ''),
        path.join(this.appPath, filePath),
      ]),
    );

    return {
      root: this.appPath,
      plugins: [
        tsconfigPaths({ root: this.appPath }),
      ],
      build: {
        outDir: functionsOutputDir,
        emptyOutDir: false,
        watch: {
          include: ['**/*.ts', '**/*.tsx', '**/*.json'],
          exclude: ['node_modules/**', '.twenty/**', 'dist/**'],
        },
        lib: {
          entry: entries,
          formats: ['es'],
          fileName: (_, entryName) => `${entryName}.mjs`,
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
