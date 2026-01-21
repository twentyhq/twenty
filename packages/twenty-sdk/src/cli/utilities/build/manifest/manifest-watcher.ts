import chalk from 'chalk';
import * as fs from 'fs-extra';
import path from 'path';
import { type ApplicationManifest } from 'twenty-shared/application';
import { build, type InlineConfig, type Plugin, type Rollup } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { OUTPUT_DIR } from '../common/constants';
import { printWatchingMessage } from '../common/display';
import { type RestartableWatcher } from '../common/restartable-watcher.interface';
import { runManifestBuild } from './manifest-build';

export type ManifestWatcherCallbacks = {
  onBuildSuccess?: (manifest: ApplicationManifest) => void;
};

export type ManifestWatcherOptions = {
  appPath: string;
  callbacks?: ManifestWatcherCallbacks;
};

export class ManifestWatcher implements RestartableWatcher {
  private appPath: string;
  private callbacks: ManifestWatcherCallbacks;
  private innerWatcher: Rollup.RollupWatcher | null = null;

  constructor(options: ManifestWatcherOptions) {
    this.appPath = options.appPath;
    this.callbacks = options.callbacks ?? {};
  }
  restart(_manifest: ApplicationManifest): Promise<void> {
    throw new Error('Method not implemented.');
  }

  shouldRestart(_oldManifest: ApplicationManifest | null, _newManifest: ApplicationManifest): boolean {
    throw new Error('Method not implemented.');
  }

  async start(): Promise<void> {
    const config = this.createConfig();
    this.innerWatcher = await build(config) as Rollup.RollupWatcher;

    this.innerWatcher.on('event', (event) => {
      if (event.code === 'ERROR') {
        console.error(chalk.red('  ✗ Manifest watcher error:'), event.error?.message);
      }
    });

    console.log(chalk.gray('  📂 Manifest watcher started'));
  }

  async close(): Promise<void> {
    await this.innerWatcher?.close();
    const tmpDir = path.join(this.appPath, OUTPUT_DIR, 'manifest-watcher-tmp');
    await fs.remove(tmpDir);
  }

  private createManifestBuildPlugin(): Plugin {
    let isFirstBuild = true;

    return {
      name: 'manifest-build-plugin',
      writeBundle: async () => {
        if (isFirstBuild) {
          isFirstBuild = false;
          return;
        }

        const manifest = await runManifestBuild(this.appPath);

        if (manifest) {
          printWatchingMessage();
          this.callbacks.onBuildSuccess?.(manifest);
        }
      },
    };
  }

  private createConfig(): InlineConfig {
    const outputDir = path.join(this.appPath, OUTPUT_DIR, 'manifest-watcher-tmp');
    const entryPath = path.join(this.appPath, 'src/app/application.config.ts');

    return {
      root: this.appPath,
      plugins: [
        tsconfigPaths({ root: this.appPath }),
        this.createManifestBuildPlugin(),
      ],
      build: {
        outDir: outputDir,
        emptyOutDir: true,
        watch: {
          include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.json'],
          exclude: ['node_modules/**', '.twenty/**', 'dist/**'],
        },
        lib: {
          entry: { __manifest_watch__: entryPath },
          formats: ['es'],
          fileName: () => '__manifest_watch__.js',
        },
        rollupOptions: {
          external: (id) => {
            if (id === entryPath || id.endsWith('application.config.ts')) {
              return false;
            }
            return true;
          },
          treeshake: false,
        },
        minify: false,
        sourcemap: false,
      },
      logLevel: 'silent',
      configFile: false,
    };
  }
}
