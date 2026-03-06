import { appPack } from '@/cli/public-operations/app-pack';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import chalk from 'chalk';

export type AppPackCommandOptions = {
  appPath?: string;
};

export class AppPackCommand {
  async execute(options: AppPackCommandOptions): Promise<void> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    console.log(chalk.blue('Building and packing application...'));
    console.log(chalk.gray(`App path: ${appPath}`));
    console.log('');

    const result = await appPack({
      appPath,
      onProgress: (message) => console.log(chalk.gray(message)),
    });

    if (!result.success) {
      console.error(chalk.red(result.error.message));
      process.exit(1);
    }

    console.log(chalk.green('✓ Application packed successfully'));
    console.log(chalk.gray(`Tarball: ${result.data.tarballPath}`));
  }
}
