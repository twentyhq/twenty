import { appClaim } from '@/cli/public-operations/app-claim';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import chalk from 'chalk';

export type AppClaimCommandOptions = {
  packageName: string;
  appPath?: string;
};

export class AppClaimCommand {
  async execute(options: AppClaimCommandOptions): Promise<void> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    console.log(
      chalk.blue(
        `Claiming npm package "${options.packageName}" for this workspace...`,
      ),
    );
    console.log(chalk.gray(`App path: ${appPath}`));
    console.log('');

    const result = await appClaim({
      packageName: options.packageName,
      appPath,
      onProgress: (message) => console.log(chalk.gray(message)),
    });

    if (!result.success) {
      console.error(chalk.red(result.error.message));
      process.exit(1);
    }

    console.log(
      chalk.green(`✓ Claim file written to ${result.data.claimFilePath}`),
    );
    console.log('');
    console.log(chalk.yellow('Next steps:'));
    console.log(
      chalk.yellow(
        '  1. Build and publish your app to npm (the claim file will be included)',
      ),
    );
    console.log(
      chalk.yellow(
        `  2. Run \`twenty app:verify-claim ${options.packageName}\` to verify ownership`,
      ),
    );
  }
}
