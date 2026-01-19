import { ApiService } from '@/cli/utilities/api/services/api.service';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/constants/current-execution-directory';
import { ManifestValidationError } from '@/cli/utilities/manifest/types/manifest.types';
import {
  displayEntitySummary,
  displayErrors,
  displayWarnings,
} from '@/cli/utilities/manifest/utils/manifest-display';
import { loadManifest } from '@/cli/utilities/manifest/utils/manifest-load';
import chalk from 'chalk';
import * as chokidar from 'chokidar';

export class AppWatchCommand {
  private apiService = new ApiService();

  async execute(options: {
    appPath?: string;
    debounce: string;
  }): Promise<void> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    const debounceMs = parseInt(options.debounce, 10);

    this.logStartupInfo(appPath, debounceMs);

    await this.synchronize(appPath);

    const watcher = this.setupFileWatcher(appPath, debounceMs);

    this.setupGracefulShutdown(watcher);
  }

  private async synchronize(appPath: string) {
    try {
      const { manifest, packageJson, yarnLock, warnings } =
        await loadManifest(appPath);

      displayEntitySummary(manifest);

      displayWarnings(warnings);

      await this.apiService.syncApplication({
        manifest,
        packageJson,
        yarnLock,
      });

      console.log(chalk.green('  ✓ Synced with server'));
    } catch (error) {
      if (error instanceof ManifestValidationError) {
        displayErrors(error);
      } else {
        console.error(
          chalk.red('  ✗ Sync failed:'),
          error instanceof Error ? error.message : error,
        );
      }
    }
  }

  private logStartupInfo(appPath: string, debounceMs: number): void {
    console.log(chalk.blue('🚀 Starting Twenty Application Development Mode'));
    console.log(chalk.gray(`📁 App Path: ${appPath}`));
    console.log(chalk.gray(`⏱️  Debounce: ${debounceMs}ms`));
    console.log('');
  }

  private setupFileWatcher(
    appPath: string,
    debounceMs: number,
  ): chokidar.FSWatcher {
    const watcher = chokidar.watch(appPath, {
      ignored: /node_modules|\.git/,
      persistent: true,
    });

    let timeout: NodeJS.Timeout | null = null;

    const debouncedSync = () => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(async () => {
        console.log(chalk.blue('🔄 Changes detected, syncing...'));

        await this.synchronize(appPath);

        console.log(
          chalk.gray('👀 Watching for changes... (Press Ctrl+C to stop)'),
        );
      }, debounceMs);
    };

    watcher.on('change', () => {
      debouncedSync();
    });

    console.log(
      chalk.gray('👀 Watching for changes... (Press Ctrl+C to stop)'),
    );

    return watcher;
  }

  private setupGracefulShutdown(watcher: chokidar.FSWatcher): void {
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n🛑 Stopping development mode...'));
      watcher.close();
      process.exit(0);
    });
  }
}
