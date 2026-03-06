import { appGenerateClient } from '@/cli/public-operations/app-generate-client';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import chalk from 'chalk';

export type AppGenerateClientCommandOptions = {
  appPath?: string;
};

export class AppGenerateClientCommand {
  async execute(options: AppGenerateClientCommandOptions): Promise<void> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    console.log(chalk.blue('Generating API client...'));
    console.log(chalk.gray(`App path: ${appPath}`));
    console.log('');

    const result = await appGenerateClient({
      appPath,
      onProgress: (message) => console.log(chalk.gray(message)),
    });

    if (!result.success) {
      console.error(chalk.red(result.error.message));
      process.exit(1);
    }

    console.log(
      chalk.green(
        `✓ Client generated (${result.data.fileCount} file${result.data.fileCount === 1 ? '' : 's'})`,
      ),
    );
  }
}
