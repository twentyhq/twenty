import { appPublish } from '@/cli/operations/publish';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import { checkSdkVersionCompatibility } from '@/cli/utilities/version/check-sdk-version-compatibility';
import chalk from 'chalk';

export type AppPublishCommandOptions = {
  appPath?: string;
  tag?: string;
};

export class AppPublishCommand {
  async execute(options: AppPublishCommandOptions): Promise<void> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    await checkSdkVersionCompatibility(appPath);

    console.log(chalk.blue('Publishing to npm...'));
    console.log(chalk.gray(`App path: ${appPath}\n`));

    const result = await appPublish({
      appPath,
      npmTag: options.tag,
      onProgress: (message) => console.log(chalk.gray(message)),
    });

    if (!result.success) {
      console.error(chalk.red(result.error.message));
      process.exit(1);
    }

    console.log(chalk.green('✓ Published to npm successfully'));
  }
}
