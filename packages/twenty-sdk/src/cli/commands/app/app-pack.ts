import { appBuild } from '@/cli/public-operations/app-build';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import chalk from 'chalk';
import { execSync } from 'child_process';
import path from 'path';

export type AppPackCommandOptions = {
  appPath?: string;
};

export class AppPackCommand {
  async execute(options: AppPackCommandOptions): Promise<void> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    console.log(chalk.blue('Building and packing application...'));
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

    execSync('npm pack --pack-destination .', {
      cwd: outputDir,
      stdio: 'inherit',
    });

    console.log(chalk.green('✓ Application packed successfully'));
  }
}
