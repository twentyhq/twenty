import { ApiService } from '@/cli/utilities/api/services/api.service';
import { type ApiResponse } from '@/cli/utilities/api/types/api-response.types';
import { runManifestBuild } from '@/cli/utilities/build/manifest/manifest-build';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/constants/current-execution-directory';
import chalk from 'chalk';
import * as fs from 'fs-extra';
import path from 'path';

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

    const yarnLockPath = path.join(appPath, 'yarn.lock');
    let yarnLock = '';

    if (await fs.pathExists(yarnLockPath)) {
      yarnLock = await fs.readFile(yarnLockPath, 'utf8');
    }

    const serverlessSyncResult = await this.apiService.syncApplication({
      manifest,
      yarnLock,
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
