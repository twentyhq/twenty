import chalk from 'chalk';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/constants/current-execution-directory';
import { ApiService } from '@/cli/services/api.service';
import { GenerateService } from '@/cli/services/generate.service';
import { type ApiResponse } from '@/cli/types/api-response.types';
import {
  ManifestValidationError,
  type ValidationWarning,
} from '@/cli/utils/validate-manifest';
import { displayEntitySummary } from '@/cli/utils/display-entity-summary';
import { loadManifest } from '@/cli/utils/load-manifest';

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

      // Display entity summary
      displayEntitySummary(manifest);

      // Display warnings
      this.displayWarnings(warnings);

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
          chalk.red('❌ Serverless functions Sync failed:'),
          serverlessSyncResult.error,
        );
      } else {
        console.log(chalk.green('✅ Serverless functions synced successfully'));
      }

      return serverlessSyncResult;
    } catch (error) {
      if (error instanceof ManifestValidationError) {
        this.displayValidationErrors(error);
      }
      throw error;
    }
  }

  private displayWarnings(warnings?: ValidationWarning[]): void {
    if (!warnings || warnings.length === 0) {
      return;
    }

    console.log('');
    for (const warning of warnings) {
      const path = warning.path ? `${warning.path}: ` : '';
      console.log(chalk.yellow(`  ⚠ ${path}${warning.message}`));
    }
  }

  private displayValidationErrors(error: ManifestValidationError): void {
    console.log(chalk.red('\n  ✗ Manifest validation failed:\n'));
    for (const err of error.errors) {
      console.log(chalk.red(`    • ${err.path}: ${err.message}`));
    }
    console.log('');
  }
}
