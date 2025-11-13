import chalk from 'chalk';
import { CURRENT_EXECUTION_DIRECTORY } from '../constants/current-execution-directory';
import { ApiService } from '../services/api.service';
import { ConfigService } from '../services/config.service';
import { ApiResponse } from '../types/config.types';
import { generateClient } from '../utils/generate-client';
import { loadManifest } from '../utils/load-manifest';

export class AppSyncCommand {
  private apiService = new ApiService();
  private configService = new ConfigService();

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

        await this.generateSdkAfterSync();
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

  private async generateSdkAfterSync(): Promise<void> {
    try {
      console.log(chalk.blue('📦 Generating Twenty SDK...'));

      const config = await this.configService.getConfig();

      const url = config.apiUrl;
      const token = config.apiKey;

      if (!url || !token) {
        console.log(
          chalk.yellow(
            '⚠️  Skipping SDK generation: API URL or token not configured',
          ),
        );
        return;
      }

      const outputPath = config.sdkOutputPath || 'src/generated/';

      console.log(chalk.gray(`API URL: ${url}`));
      console.log(chalk.gray(`Output: ${outputPath}`));

      await generateClient({
        url: `${url}/graphql`,
        token,
        graphqlEndpoint: 'core',
        outputPath,
      });

      console.log(chalk.green('✓ SDK generated successfully!'));
      console.log(chalk.gray(`Generated files at: ${outputPath}`));
    } catch (error) {
      console.log(
        chalk.yellow('⚠️  SDK generation failed:'),
        error instanceof Error ? error.message : error,
      );
    }
  }
}
