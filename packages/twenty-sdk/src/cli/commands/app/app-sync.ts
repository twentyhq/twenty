import { ApiService } from '@/cli/utilities/api/services/api.service';
import { type ApiResponse } from '@/cli/utilities/api/types/api-response.types';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/constants/current-execution-directory';
import { ManifestValidationError } from '@/cli/utilities/build/manifest/manifest.types';
import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';
import {
  displayEntitySummary,
  displayErrors,
  displayWarnings,
} from '@/cli/utilities/build/manifest/manifest-display';
import chalk from 'chalk';

export class AppSyncCommand {
  private apiService = new ApiService();

  async execute(
    appPath: string = CURRENT_EXECUTION_DIRECTORY,
  ): Promise<ApiResponse<any>> {
    try {
      console.log(chalk.blue('🚀 Syncing Twenty Application'));
      console.log(chalk.gray(`📁 App Path: ${appPath}`));
      console.log('');

      return await this.synchronize({ appPath });
    } catch (error) {
      console.error(
        chalk.red('Sync failed:'),
        error instanceof Error ? error.message : error,
      );
      throw error;
    }
  }

  private async synchronize({ appPath }: { appPath: string }) {
    try {
      const { manifest, warnings } = await buildManifest(appPath);

      displayEntitySummary(manifest);

      displayWarnings(warnings);

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
    } catch (error) {
      if (error instanceof ManifestValidationError) {
        displayErrors(error);
      }
      throw error;
    }
  }
}
