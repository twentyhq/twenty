import chalk from 'chalk';
import { ApiService } from '../services/api.service';
import { resolveAppPath } from '../utils/app-path-resolver';
import { syncApp } from '../utils/app-sync';

export class AppSyncCommand {
  private apiService = new ApiService();

  async execute(options: { path?: string }): Promise<void> {
    try {
      const appPath = await resolveAppPath(options.path);

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
