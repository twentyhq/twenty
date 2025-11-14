import chalk from 'chalk';
import { CURRENT_EXECUTION_DIRECTORY } from '../constants/current-execution-directory';
import { ApiService } from '../services/api.service';
import { ApiResponse } from '../types/config.types';
import { loadManifest } from '../utils/load-manifest';

export class AppSyncCommand {
  private apiService = new ApiService();

  async execute(
    appPath: string = CURRENT_EXECUTION_DIRECTORY,
  ): Promise<ApiResponse<any>> {
    try {
      console.log(chalk.blue('🚀 Syncing Twenty Application'));
      console.log(chalk.gray(`📁 App Path: ${appPath}`));
      console.log('');

      return await this.synchronizeServerlessFunctions({ appPath });
    } catch (error) {
      console.error(
        chalk.red('Sync failed:'),
        error instanceof Error ? error.message : error,
      );
      throw error;
    }
  }

  private async synchronizeServerlessFunctions({
    appPath,
  }: {
    appPath: string;
  }) {
    const { manifest, packageJson, yarnLock } = await loadManifest({
      appPath,
    });

    const serverlessSyncResult = await this.apiService.syncApplication({
      manifest,
      packageJson,
      yarnLock,
    });

    if (!serverlessSyncResult.success) {
      console.error(
        chalk.red('❌ Serverless functions Sync failed:'),
        serverlessSyncResult.error,
      );
    } else {
      console.log(chalk.green('✅ Serverless functions synced successfully'));
    }

    return serverlessSyncResult;
  }
}
