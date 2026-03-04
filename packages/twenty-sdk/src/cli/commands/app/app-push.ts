import { appBuild } from '@/cli/public-operations/app-build';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import { ApiService } from '@/cli/utilities/api/api-service';
import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

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

    const buildResult = await appBuild({
      appPath,
      onProgress: (message) => console.log(chalk.gray(message)),
    });

    if (!buildResult.success) {
      console.error(chalk.red(buildResult.error.message));
      process.exit(1);
    }

    console.log(chalk.gray('Packing tarball...'));

    const outputDir = path.join(appPath, '.twenty', 'output');

    // TODO: Extract pack logic into a shared public operation (like appBuild)
    // so app:pack and app:push share the same implementation.
    const packOutput = execSync('npm pack --pack-destination .', {
      cwd: outputDir,
      encoding: 'utf-8',
    }).trim();

    const tarballName = packOutput.split('\n').pop()!;
    const tarballPath = path.join(outputDir, tarballName);

    if (!fs.existsSync(tarballPath)) {
      console.error(chalk.red(`Tarball not found at ${tarballPath}`));
      process.exit(1);
    }

    console.log(chalk.gray(`Uploading ${path.basename(tarballPath)}...`));

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
