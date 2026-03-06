import { appVerifyClaim } from '@/cli/public-operations/app-verify-claim';
import chalk from 'chalk';

export type AppVerifyClaimCommandOptions = {
  packageName: string;
};

export class AppVerifyClaimCommand {
  async execute(options: AppVerifyClaimCommandOptions): Promise<void> {
    console.log(
      chalk.blue(`Verifying npm claim for "${options.packageName}"...`),
    );
    console.log('');

    const result = await appVerifyClaim({
      packageName: options.packageName,
      onProgress: (message) => console.log(chalk.gray(message)),
    });

    if (!result.success) {
      console.error(chalk.red(result.error.message));
      process.exit(1);
    }

    console.log(
      chalk.green(`✓ Ownership verified for "${options.packageName}"`),
    );
    console.log(chalk.gray(`  Registration: ${result.data.registrationId}`));
    console.log(chalk.gray(`  Name: ${result.data.name}`));
  }
}
