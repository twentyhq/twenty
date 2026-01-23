import { ApiService } from '@/cli/utilities/api/services/api.service';
import { type ApiResponse } from '@/cli/utilities/api/types/api-response.types';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/constants/current-execution-directory';
import chalk from 'chalk';
import * as fs from 'fs-extra';
import path from 'path';
import { AppBuildCommand } from '@/cli/commands/app/app-build';

export class AppSyncCommand {
  private apiService = new ApiService();
  private buildCommand = new AppBuildCommand();

  async execute(
    appPath: string = CURRENT_EXECUTION_DIRECTORY,
  ): Promise<ApiResponse<any>> {
    const result = await this.buildCommand.execute({
      appPath,
    });

    if (!result.success) {
      return result;
    }

    console.log(chalk.blue('🚀 Syncing Twenty Application'));
    console.log('');

    const manifest = result.data.manifest;

    if (!manifest) {
      return result;
    }

    const yarnLockPath = path.join(appPath, 'yarn.lock');
    let yarnLock = '';

    if (await fs.pathExists(yarnLockPath)) {
      yarnLock = await fs.readFile(yarnLockPath, 'utf8');
    }

    const syncResult = await this.apiService.syncApplication({
      manifest,
      yarnLock,
    });

    if (!syncResult.success) {
      console.error(chalk.red('❌ Application Sync failed:'), syncResult.error);
    } else {
      console.log(chalk.green('✅ Application synced successfully'));
    }

    return syncResult;
  }
}
