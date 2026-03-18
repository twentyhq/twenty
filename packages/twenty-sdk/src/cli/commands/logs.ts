import { ApiService } from '@/cli/utilities/api/api-service';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import chalk from 'chalk';
import { readManifestFromFile } from '@/cli/utilities/build/manifest/manifest-reader';

export class LogicFunctionLogsCommand {
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
      const manifest = await readManifestFromFile(appPath);

      if (!manifest) {
        process.exit(1);
      }

      this.logWatchInfo({
        appName: manifest.application.displayName,
        functionUniversalIdentifier,
        functionName,
      });
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

  private logWatchInfo({
    appName,
    functionUniversalIdentifier,
    functionName,
  }: {
    appName?: string;
    functionUniversalIdentifier?: string;
    functionName?: string;
  }): void {
    const appPath = appName ?? 'Twenty Application';

    const functionIdentifier =
      functionUniversalIdentifier || functionName
        ? `function "${functionUniversalIdentifier || functionName}"`
        : 'functions';

    console.log(
      chalk.blue(`🚀 Watching ${appPath} ${functionIdentifier} logs:`),
    );

    console.log('');
  }
}
