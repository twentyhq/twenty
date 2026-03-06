import { appPublish } from '@/cli/public-operations/app-publish';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import chalk from 'chalk';

export type AppPublishCommandOptions = {
  appPath?: string;
  server?: string;
  token?: string;
  tag?: string;
};

export class AppPublishCommand {
  async execute(options: AppPublishCommandOptions): Promise<void> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;
    const isServerPublish = !!options.server;

    console.log(
      chalk.blue(
        isServerPublish
          ? `Publishing to server ${options.server}...`
          : 'Publishing to npm...',
      ),
    );
    console.log(chalk.gray(`App path: ${appPath}`));
    console.log('');

    const result = await appPublish({
      appPath,
      server: options.server,
      token: options.token,
      npmTag: options.tag,
      onProgress: (message) => console.log(chalk.gray(message)),
    });

    if (!result.success) {
      console.error(chalk.red(result.error.message));
      process.exit(1);
    }

    if (result.data.target === 'npm') {
      console.log(chalk.green('✓ Published to npm successfully'));
    } else {
      console.log(
        chalk.green('✓ Published to server and installed successfully'),
      );
    }
  }
}
