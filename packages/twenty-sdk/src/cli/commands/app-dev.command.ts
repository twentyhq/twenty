import chalk from 'chalk';
import * as chokidar from 'chokidar';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/constants/current-execution-directory';
import { ApiService } from '@/cli/services/api.service';
import { ManifestValidationError } from '@/cli/utils/validate-manifest';
import { displayEntitySummary } from '@/cli/utils/display-entity-summary';
import { loadManifest } from '@/cli/utils/load-manifest';
import { displayWarnings } from '@/cli/utils/display-warnings';
import { displayErrors } from '@/cli/utils/display-errors';

export class AppDevCommand {
  private apiService = new ApiService();

  async execute(options: {
    appPath?: string;
    debounce: string;
  }): Promise<void> {
    try {
      const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

      const debounceMs = parseInt(options.debounce, 10);

      this.logStartupInfo(appPath, debounceMs);

      await this.synchronize(appPath);

      const watcher = this.setupFileWatcher(appPath, debounceMs);

      this.setupGracefulShutdown(watcher);
    } catch (error) {
      console.error(
        chalk.red('Development mode failed:'),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
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
        throw error;
      }
      throw error;
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
