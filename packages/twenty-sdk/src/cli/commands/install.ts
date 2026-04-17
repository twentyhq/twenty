import { appInstall } from '@/cli/operations/install';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import { formatInstallValidationErrors } from '@/cli/utilities/install/format-install-validation-errors';
import { checkSdkVersionCompatibility } from '@/cli/utilities/version/check-sdk-version-compatibility';
import chalk from 'chalk';

export type AppInstallCommandOptions = {
  appPath?: string;
  remote?: string;
};

export class AppInstallCommand {
  async execute(options: AppInstallCommandOptions): Promise<void> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    await checkSdkVersionCompatibility(appPath);

    console.log(chalk.blue('Installing application...'));
    console.log(chalk.gray(`App path: ${appPath}\n`));

    const result = await appInstall({
      appPath,
      remote: options.remote,
    });

    if (!result.success) {
      console.error(chalk.red(result.error.message));

      const validationLines = formatInstallValidationErrors(
        result.error.details,
      );

      if (validationLines.length > 0) {
        console.error('');

        for (const line of validationLines) {
          console.error(chalk.red(line));
        }
      }

      process.exit(1);
    }

    console.log(chalk.green('✓ Application installed'));
  }
}
