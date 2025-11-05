import chalk from 'chalk';
import { CURRENT_EXECUTION_DIRECTORY } from '../constants/current-execution-directory';
import { ApiService } from '../services/api.service';
import { ApiResponse } from '../types/config.types';
import { loadManifest } from '../utils/load-manifest';

export class AppSyncCommand {
  private apiService = new ApiService();

  // TODO improve typing
  async execute(
    appPath: string = CURRENT_EXECUTION_DIRECTORY,
  ): Promise<ApiResponse<any>> {
    try {
      console.log(chalk.blue('🚀 Syncing Twenty Application'));
      console.log(chalk.gray(`📁 App Path: ${appPath}`));
      console.log('');

      const { manifest, packageJson, yarnLock } = await loadManifest(appPath);

      const result = await this.apiService.syncApplication({
        manifest,
        packageJson,
        yarnLock,
      });

      if (!result.success) {
        console.error(chalk.red('❌ Sync failed:'), result.error);
      } else {
        console.log(chalk.green('✅ Application synced successfully'));
      }

      return result;
    } catch (error) {
      console.error(
        chalk.red('Sync failed:'),
        error instanceof Error ? error.message : error,
      );
      throw error;
    }
  }
}
