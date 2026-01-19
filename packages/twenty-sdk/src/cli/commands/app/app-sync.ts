import chalk from 'chalk';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config';
import { ApiService, type ApiResponse } from '@/cli/utilities/api';
import { GenerateService } from '@/cli/utilities/generate';
import {
  ManifestValidationError,
  displayEntitySummary,
  loadManifest,
  displayWarnings,
  displayErrors,
} from '@/cli/utilities/manifest';

export class AppSyncCommand {
  private apiService = new ApiService();
  private generateService = new GenerateService();

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
      const { manifest, packageJson, yarnLock, shouldGenerate, warnings } =
        await loadManifest(appPath);

      displayEntitySummary(manifest);

      displayWarnings(warnings);

      let serverlessSyncResult = await this.apiService.syncApplication({
        manifest,
        packageJson,
        yarnLock,
      });

      if (shouldGenerate) {
        await this.generateService.generateClient(appPath);

        const { manifest: manifestWithClient } = await loadManifest(appPath);

        serverlessSyncResult = await this.apiService.syncApplication({
          manifest: manifestWithClient,
          packageJson,
          yarnLock,
        });
      }

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
