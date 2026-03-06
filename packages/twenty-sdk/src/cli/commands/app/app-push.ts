import { appPack } from '@/cli/public-operations/app-pack';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import { ApiService } from '@/cli/utilities/api/api-service';
import chalk from 'chalk';
import fs from 'fs';

export type AppPushCommandOptions = {
  appPath?: string;
  server?: string;
  token?: string;
};

export class AppPushCommand {
  async execute(options: AppPushCommandOptions): Promise<void> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    console.log(chalk.blue('Building, packing, and pushing application...'));
    console.log(chalk.gray(`App path: ${appPath}`));
    console.log('');

    const packResult = await appPack({
      appPath,
      onProgress: (message) => console.log(chalk.gray(message)),
    });

    if (!packResult.success) {
      console.error(chalk.red(packResult.error.message));
      process.exit(1);
    }

    const { tarballPath } = packResult.data;

    console.log(chalk.gray(`Uploading ${tarballPath}...`));

    const tarballBuffer = fs.readFileSync(tarballPath);

    const apiService = new ApiService({
      serverUrl: options.server,
      token: options.token,
    });

    const uploadResult = await apiService.uploadAppTarball({ tarballBuffer });

    if (!uploadResult.success) {
      console.error(chalk.red(`Upload failed: ${uploadResult.error}`));
      process.exit(1);
    }

    console.log(chalk.gray('Installing application...'));

    const installResult = await apiService.installTarballApp({
      universalIdentifier: uploadResult.data.universalIdentifier,
    });

    if (!installResult.success) {
      console.error(chalk.red(`Install failed: ${installResult.error}`));
      process.exit(1);
    }

    console.log(chalk.green('✓ Application pushed and installed successfully'));
  }
}
