import chalk from 'chalk';
import { ApiService } from '../services/api.service';
import { syncApp } from '../utils/app-sync';
import { CURRENT_EXECUTION_DIRECTORY } from '../constants/current-execution-directory';

export class AppSyncCommand {
  private apiService = new ApiService();

  async execute(): Promise<void> {
    try {
      const appPath = CURRENT_EXECUTION_DIRECTORY;

      console.log(chalk.blue('🚀 Syncing Twenty Application'));
      console.log(chalk.gray(`📁 App Path: ${appPath}`));
      console.log('');

      const result = await syncApp(appPath, this.apiService);

      if (!result.success) {
        console.error(chalk.red('❌ Sync failed:'), result.error);
        process.exit(1);
      }

      console.log(chalk.green('✅ Application synced successfully'));
    } catch (error) {
      console.error(
        chalk.red('Sync failed:'),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }
}
