import chalk from 'chalk';
import { formatDiagnosticsWithColorAndContext, sys } from 'typescript';
import { CURRENT_EXECUTION_DIRECTORY } from '../constants/current-execution-directory';
import { GENERATED_FOLDER_NAME } from '../constants/generated-folder-name';
import { ApiService } from '../services/api.service';
import { ConfigService } from '../services/config.service';
import { ApiResponse } from '../types/config.types';
import { generateClient } from '../utils/generate-client';
import { loadManifest } from '../utils/load-manifest';
import { getTsProgramAndDiagnostics } from '../utils/validate-ts-program';

export class AppSyncCommand {
  private apiService = new ApiService();
  private configService = new ConfigService();

  private async synchronizeEverythingButServerlessFunctions({
    appPath,
  }: {
    appPath: string;
  }) {
    const { diagnostics, program } = await getTsProgramAndDiagnostics({
      appPath,
    });
    const { manifest, packageJson, yarnLock } = await loadManifest({
      appPath,
      program,
    });

    if (diagnostics.length > 0) {
      const formattedDiagnostics = formatDiagnosticsWithColorAndContext(
        diagnostics,
        {
          getCanonicalFileName: (f) => f,
          getCurrentDirectory: sys.getCurrentDirectory,
          getNewLine: () => sys.newLine,
        },
      );

      console.warn(formattedDiagnostics);
    }

    const everythingButServerlessFunctionsSyncResult =
      await this.apiService.syncApplication({
        manifest,
        packageJson,
        yarnLock,
      });

    if (!everythingButServerlessFunctionsSyncResult.success) {
      console.error(
        chalk.red('❌ Sync failed:'),
        everythingButServerlessFunctionsSyncResult.error,
      );
    } else {
      console.log(chalk.green('✅ Application synced successfully'));

      await this.generateSdkAfterSync();
    }
  }

  private async synchronizeServerlessFunctions({
    appPath,
  }: {
    appPath: string;
  }) {
    const { diagnostics, program } = await getTsProgramAndDiagnostics({
      appPath,
    });
    const { manifest, packageJson, yarnLock } = await loadManifest({
      appPath,
      program,
    });

    if (diagnostics.length > 0) {
      const formattedDiagnostics = formatDiagnosticsWithColorAndContext(
        diagnostics,
        {
          getCanonicalFileName: (f) => f,
          getCurrentDirectory: sys.getCurrentDirectory,
          getNewLine: () => sys.newLine,
        },
      );

      console.warn(formattedDiagnostics);
    }

    const serverlessSyncResult = await this.apiService.syncApplication({
      manifest: {
        application: manifest.application,
        objects: [],
        sources: {},
        serverlessFunctions: manifest.serverlessFunctions,
      },
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
  // TODO improve typing
  async execute(
    appPath: string = CURRENT_EXECUTION_DIRECTORY,
  ): Promise<ApiResponse<any>> {
    try {
      console.log(chalk.blue('🚀 Syncing Twenty Application'));
      console.log(chalk.gray(`📁 App Path: ${appPath}`));
      console.log('');

      await this.synchronizeEverythingButServerlessFunctions({ appPath });

      return await this.synchronizeServerlessFunctions({ appPath });
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

      const outputPath = GENERATED_FOLDER_NAME;
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
