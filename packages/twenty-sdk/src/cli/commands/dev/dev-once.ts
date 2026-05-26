import { appDevOnce } from '@/cli/operations/dev-once';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import { checkSdkVersionCompatibility } from '@/cli/utilities/version/check-sdk-version-compatibility';
import chalk from 'chalk';

export type AppDevOnceCommandOptions = {
  appPath?: string;
  verbose?: boolean;
};

export class AppDevOnceCommand {
  async execute(options: AppDevOnceCommandOptions): Promise<void> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    await checkSdkVersionCompatibility(appPath);

    console.log(chalk.blue('Syncing application...'));
    console.log(chalk.gray(`App path: ${appPath}\n`));

    const result = await appDevOnce({
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
