import chalk from 'chalk';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/constants/current-execution-directory';
import { loadManifest } from '@/cli/utils/load-manifest';
import { ApiService } from '@/cli/services/api.service';

export class AppLogsCommand {
  private apiService = new ApiService();

  async execute({
    appPath = CURRENT_EXECUTION_DIRECTORY,
    functionUniversalIdentifier,
    functionName,
  }: {
    appPath?: string;
    functionUniversalIdentifier?: string;
    functionName?: string;
  }): Promise<void> {
    try {
      const { manifest } = await loadManifest(appPath);
      await this.apiService.subscribeToLogs({
        applicationUniversalIdentifier:
          manifest.application.universalIdentifier,
        functionUniversalIdentifier,
        functionName,
      });
    } catch (error) {
      console.error(
        chalk.red('Watch logs failed:'),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }
}
