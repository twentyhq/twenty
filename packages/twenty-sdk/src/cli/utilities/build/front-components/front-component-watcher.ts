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
import { FRONT_COMPONENTS_DIR } from './constants';

export const FRONT_COMPONENT_EXTERNAL_MODULES: (string | RegExp)[] = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  /^twenty-sdk/,
  /^twenty-shared/,
  /^@\//,
];

export class FrontComponentsWatcher implements RestartableWatcher {
  private appPath: string;
  private componentPaths: string[];
  private innerWatcher: Rollup.RollupWatcher | null = null;
  private isRestarting = false;

  constructor(options: RestartableWatcherOptions) {
    this.appPath = options.appPath;
    this.componentPaths = options.buildResult?.filePaths.frontComponents ?? [];
  }

  shouldRestart(result: ManifestBuildResult): boolean {
    const currentPaths = this.componentPaths.sort().join(',');
    const newPaths = result.filePaths.frontComponents.sort().join(',');

    return currentPaths !== newPaths;
  }

  async start(): Promise<void> {
    const outputDir = path.join(this.appPath, OUTPUT_DIR, FRONT_COMPONENTS_DIR);
    await fs.ensureDir(outputDir);

    if (this.componentPaths.length > 0) {
      console.log(chalk.blue('  🎨 Building front components...'));
      this.innerWatcher = await this.createWatcher();
    } else {
      console.log(chalk.gray('  No front components to build'));
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
      console.log(chalk.yellow('🔄 Restarting front components watcher...'));
      await this.innerWatcher?.close();
      this.innerWatcher = null;

      const outputDir = path.join(this.appPath, OUTPUT_DIR, FRONT_COMPONENTS_DIR);
      const newPaths = result.filePaths.frontComponents;
      await cleanupRemovedFiles(outputDir, this.componentPaths, newPaths);
      this.componentPaths = newPaths;

      if (this.componentPaths.length > 0) {
        console.log(chalk.blue('  🎨 Building front components...'));
        this.innerWatcher = await this.createWatcher();
      } else {
        console.log(chalk.gray('  No front components to build'));
        printWatchingMessage();
      }

      console.log(chalk.green('✓ Front components watcher restarted'));
    } finally {
      this.isRestarting = false;
    }
  }

  private async createWatcher(): Promise<Rollup.RollupWatcher> {
    const config = this.createConfig();
    const watcher = await build(config) as Rollup.RollupWatcher;

    watcher.on('event', (event) => {
      if (event.code === 'END') {
        console.log(chalk.green('  ✓ Front components built'));
        printWatchingMessage();
      } else if (event.code === 'ERROR') {
        console.error(chalk.red('  ✗ Front component build error:'), event.error?.message);
      }
    });

    return watcher;
  }

  private createConfig(): InlineConfig {
    const frontComponentsOutputDir = path.join(this.appPath, OUTPUT_DIR, FRONT_COMPONENTS_DIR);

    const entries = Object.fromEntries(
      this.componentPaths.map((filePath) => [
        filePath.replace(/\.tsx?$/, ''),
        path.join(this.appPath, filePath),
      ]),
    );

    return {
      root: this.appPath,
      plugins: [
        tsconfigPaths({ root: this.appPath }),
      ],
      esbuild: {
        jsx: 'automatic',
      },
      build: {
        outDir: frontComponentsOutputDir,
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
          external: FRONT_COMPONENT_EXTERNAL_MODULES,
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
