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
  private innerWatchers: Rollup.RollupWatcher[] = [];
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
    await fs.emptyDir(outputDir);

    if (this.componentPaths.length > 0) {
      console.log(chalk.blue('  🎨 Building front components...'));
      this.innerWatchers = await this.createWatchers();
    } else {
      console.log(chalk.gray('  No front components to build'));
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
      console.log(chalk.yellow('🔄 Restarting front components watcher...'));
      await this.close();

      const outputDir = path.join(this.appPath, OUTPUT_DIR, FRONT_COMPONENTS_DIR);
      const newPaths = result.filePaths.frontComponents;
      await cleanupRemovedFiles(outputDir, this.componentPaths, newPaths);
      this.componentPaths = newPaths;

      if (this.componentPaths.length > 0) {
        console.log(chalk.blue('  🎨 Building front components...'));
        this.innerWatchers = await this.createWatchers();
      } else {
        console.log(chalk.gray('  No front components to build'));
        printWatchingMessage();
      }

      console.log(chalk.green('✓ Front components watcher restarted'));
    } finally {
      this.isRestarting = false;
    }
  }

  // Build each component separately to ensure self-contained bundles (no shared chunks)
  private async createWatchers(): Promise<Rollup.RollupWatcher[]> {
    let completedCount = 0;
    const totalCount = this.componentPaths.length;

    const watchers = await Promise.all(
      this.componentPaths.map(async (componentPath) => {
        const config = this.createConfig(componentPath);
        const watcher = (await build(config)) as Rollup.RollupWatcher;

        watcher.on('event', (event) => {
          if (event.code === 'END') {
            completedCount++;
            if (completedCount >= totalCount) {
              console.log(chalk.green('  ✓ Front components built'));
              printWatchingMessage();
              completedCount = 0;
            }
          } else if (event.code === 'ERROR') {
            console.error(
              chalk.red('  ✗ Front component build error:'),
              event.error?.message,
            );
          }
        });

        return watcher;
      }),
    );

    return watchers;
  }

  private createConfig(componentPath: string): InlineConfig {
    const frontComponentsOutputDir = path.join(this.appPath, OUTPUT_DIR, FRONT_COMPONENTS_DIR);
    const entryName = componentPath.replace(/\.tsx?$/, '');

    return {
      root: this.appPath,
      plugins: [tsconfigPaths({ root: this.appPath })],
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
          entry: path.join(this.appPath, componentPath),
          formats: ['es'],
          fileName: () => `${entryName}.mjs`,
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
