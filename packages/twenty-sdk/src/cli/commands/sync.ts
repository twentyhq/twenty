import { appSync } from '@/cli/operations/sync';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import { checkSdkVersionCompatibility } from '@/cli/utilities/version/check-sdk-version-compatibility';
import chalk from 'chalk';

export type AppSyncCommandOptions = {
  appPath?: string;
  verbose?: boolean;
};

export class AppSyncCommand {
  async execute(options: AppSyncCommandOptions): Promise<void> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    await checkSdkVersionCompatibility(appPath);

    console.log(chalk.blue('Syncing application...'));
    console.log(chalk.gray(`App path: ${appPath}\n`));

    const result = await appSync({
      appPath,
      verbose: options.verbose,
      onProgress: (message) => console.log(chalk.gray(message)),
    });

    if (!result.success) {
      console.error(chalk.red(result.error.message));
      process.exit(1);
    }

    console.log(
      chalk.green(
        `\n✓ Synced ${result.data.applicationDisplayName} (${result.data.fileCount} file${result.data.fileCount === 1 ? '' : 's'})`,
      ),
    );
    console.log(chalk.gray(`Output: ${result.data.outputDir}`));
  }
}
