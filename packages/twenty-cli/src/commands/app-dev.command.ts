import chalk from 'chalk';
import * as chokidar from 'chokidar';
import { ApiService } from '../services/api.service';
import { resolveAppPath } from '../utils/app-path-resolver';
import { syncApp } from '../utils/app-sync';

export class AppDevCommand {
  private apiService = new ApiService();

  async execute(options: {
    path?: string;
    debounce: string;
    verbose?: boolean;
  }): Promise<void> {
    try {
      const appPath = await resolveAppPath(options.path, options.verbose);
      const debounceMs = parseInt(options.debounce, 10);

      this.logStartupInfo(appPath, debounceMs, options.verbose);

      await syncApp(appPath, this.apiService);

      const watcher = this.setupFileWatcher(
        appPath,
        debounceMs,
        options.verbose,
      );

      this.setupGracefulShutdown(watcher);
    } catch (error) {
      console.error(
        chalk.red('Development mode failed:'),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }

  private logStartupInfo(
    appPath: string,
    debounceMs: number,
    verbose?: boolean,
  ): void {
    console.log(chalk.blue('🚀 Starting Twenty Application Development Mode'));
    console.log(chalk.gray(`📁 App Path: ${appPath}`));
    console.log(chalk.gray(`⏱️  Debounce: ${debounceMs}ms`));
    console.log(chalk.gray(`🔧 Verbose: ${verbose ? 'On' : 'Off'}`));
    console.log('');
  }

  private setupFileWatcher(
    appPath: string,
    debounceMs: number,
    verbose?: boolean,
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
        await syncApp(appPath, this.apiService);
        console.log(
          chalk.gray('👀 Watching for changes... (Press Ctrl+C to stop)'),
        );
      }, debounceMs);
    };

    watcher.on('change', (filePath) => {
      if (verbose) {
        console.log(chalk.gray(`📝 ${filePath} changed`));
      }
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
