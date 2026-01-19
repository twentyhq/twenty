import { FUNCTIONS_DIR } from '@/cli/constants/functions-dir';
import { OUTPUT_DIR } from '@/cli/constants/output-dir';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/constants/current-execution-directory';
import {
  createDevBuildConfig,
  createManifestPlugin,
  runManifestBuild,
  type ManifestPluginState,
} from '@/cli/utilities/vite';
import chalk from 'chalk';
import * as fs from 'fs-extra';
import path from 'path';
import { build } from 'vite';

export type AppDevOptions = {
  appPath?: string;
};

type BuildWatcher = {
  close: () => Promise<void>;
  on?: (event: string, callback: (event: unknown) => void) => void;
};

export class AppDevCommand {
  private watcher: BuildWatcher | null = null;
  private appPath: string = '';
  private isRestarting: boolean = false;
  private manifestState: ManifestPluginState = { currentEntryPoints: [] };

  async execute(options: AppDevOptions): Promise<void> {
    this.appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    console.log(chalk.blue('🚀 Starting Twenty Application Development Mode'));
    console.log(chalk.gray(`📁 App Path: ${this.appPath}`));
    console.log('');

    await this.ensureOutputDirs();
    await this.startWatcher();

    this.setupGracefulShutdown();
  }

  private async ensureOutputDirs(): Promise<void> {
    const outputDir = path.join(this.appPath, OUTPUT_DIR);
    const functionsDir = path.join(outputDir, FUNCTIONS_DIR);
    await fs.ensureDir(functionsDir);
  }

  private async startWatcher(): Promise<void> {
    // Initial manifest build
    const functionInput = await runManifestBuild(
      this.appPath,
      this.manifestState,
    );

    const hasFunctions = Object.keys(functionInput).length > 0;

    if (hasFunctions) {
      console.log(chalk.blue('  📦 Building functions...'));
    } else {
      console.log(chalk.gray('  No functions to build'));
    }

    const manifestPlugin = createManifestPlugin(
      this.appPath,
      this.manifestState,
      {
        onEntryPointsChange: () => this.scheduleRestart(),
      },
    );

    const config = createDevBuildConfig({
      appPath: this.appPath,
      functionInput,
      plugins: [manifestPlugin],
    });

    this.watcher = (await build(config)) as BuildWatcher;

    if (this.watcher.on) {
      this.watcher.on('event', (event: unknown) => {
        const evt = event as { code: string; error?: { message: string } };
        if (evt.code === 'END') {
          if (hasFunctions) {
            console.log(chalk.green('  ✓ Functions built'));
          }
          console.log('');
          console.log(
            chalk.gray('👀 Watching for changes... (Press Ctrl+C to stop)'),
          );
        } else if (evt.code === 'ERROR') {
          console.error(chalk.red('  ✗ Build error:'), evt.error?.message);
        }
      });
    }
  }

  private scheduleRestart(): void {
    if (this.isRestarting) {
      return;
    }

    setImmediate(() => {
      this.restartWatcher();
    });
  }

  private async restartWatcher(): Promise<void> {
    if (this.isRestarting) {
      return;
    }

    this.isRestarting = true;

    try {
      console.log(
        chalk.yellow('🔄 Function entry points changed, restarting...'),
      );

      if (this.watcher) {
        await this.watcher.close();
      }

      await this.startWatcher();

      console.log(chalk.green('✓ Restarted with new entry points'));
    } finally {
      this.isRestarting = false;
    }
  }

  private setupGracefulShutdown(): void {
    process.on('SIGINT', async () => {
      console.log(chalk.yellow('\n🛑 Stopping development mode...'));

      if (this.watcher) {
        await this.watcher.close();
      }

      process.exit(0);
    });
  }
}
