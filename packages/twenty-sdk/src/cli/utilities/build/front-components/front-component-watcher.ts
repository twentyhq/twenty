import chalk from 'chalk';
import * as fs from 'fs-extra';
import path from 'path';
import type { ApplicationManifest } from 'twenty-shared/application';
import { build, type InlineConfig, type Rollup } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { OUTPUT_DIR } from '../common/constants';
import { printWatchingMessage } from '../common/display';
import {
  type RestartableWatcher,
  type RestartableWatcherOptions,
} from '../common/restartable-watcher.interface';
import { FRONT_COMPONENTS_DIR } from './constants';

const buildFrontComponentEntries = (
  appPath: string,
  components: Array<{ componentPath: string }>,
): Record<string, string> => {
  const entries: Record<string, string> = {};

  for (const component of components) {
    const inputPath = path.join(appPath, component.componentPath);
    const outputPath = component.componentPath.replace(/\.tsx?$/, '');

    entries[outputPath] = inputPath;
  }

  return entries;
};

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
  private entries: Record<string, string>;
  private innerWatcher: Rollup.RollupWatcher | null = null;
  private isRestarting = false;

  constructor(options: RestartableWatcherOptions) {
    this.appPath = options.appPath;
    this.entries = buildFrontComponentEntries(
      options.appPath,
      options.manifest?.frontComponents ?? [],
    );
  }

  shouldRestart(manifest: ApplicationManifest): boolean {
    const newEntries = buildFrontComponentEntries(this.appPath, manifest.frontComponents ?? []);
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
    const outputDir = path.join(this.appPath, OUTPUT_DIR, FRONT_COMPONENTS_DIR);
    await fs.ensureDir(outputDir);

    if (this.hasEntries()) {
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

  async restart(manifest: ApplicationManifest): Promise<void> {
    if (this.isRestarting) {
      return;
    }

    this.isRestarting = true;

    try {
      console.log(chalk.yellow('🔄 Restarting front components watcher...'));
      await this.innerWatcher?.close();
      this.innerWatcher = null;

      this.entries = buildFrontComponentEntries(this.appPath, manifest.frontComponents ?? []);

      if (this.hasEntries()) {
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

  private hasEntries(): boolean {
    return Object.keys(this.entries).length > 0;
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
          entry: this.entries,
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
