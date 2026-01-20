import { ApiService } from '@/cli/utilities/api/services/api.service';
import { type ApiResponse } from '@/cli/utilities/api/types/api-response.types';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/constants/current-execution-directory';
import { runManifestBuild } from '@/cli/utilities/build/manifest/manifest-build';
import chalk from 'chalk';

export class AppSyncCommand {
  private apiService = new ApiService();

  async execute(
    appPath: string = CURRENT_EXECUTION_DIRECTORY,
  ): Promise<ApiResponse<any>> {
    console.log(chalk.blue('🚀 Syncing Twenty Application'));
    console.log(chalk.gray(`📁 App Path: ${appPath}`));
    console.log('');

    const manifest = await runManifestBuild(appPath, { writeOutput: false });

    if (!manifest) {
      return { success: false, error: 'Build failed' };
    }

    const serverlessSyncResult = await this.apiService.syncApplication({
      manifest,
    });

    if (serverlessSyncResult.success === false) {
      console.error(
        chalk.red('❌ Application Sync failed:'),
        serverlessSyncResult.error,
      );
    } else {
      console.log(chalk.green('✅ Application synced successfully'));
    }

    return serverlessSyncResult;
  }
}
