import { appBuild } from '@/cli/operations/build';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import { checkSdkVersionCompatibility } from '@/cli/utilities/version/check-sdk-version-compatibility';
import chalk from 'chalk';

export type AppBuildCommandOptions = {
  appPath?: string;
  tarball?: boolean;
};

export class AppBuildCommand {
  async execute(options: AppBuildCommandOptions): Promise<void> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    await checkSdkVersionCompatibility(appPath);

    console.log(chalk.blue('Building application...'));
    console.log(chalk.gray(`App path: ${appPath}\n`));

    const result = await appBuild({
      appPath,
      tarball: options.tarball,
      onProgress: (message) => console.log(chalk.gray(message)),
    });

    if (!result.success) {
      console.error(chalk.red(result.error.message));
      process.exit(1);
    }

    console.log(
      chalk.green(
        `✓ Build succeeded (${result.data.fileCount} file${result.data.fileCount === 1 ? '' : 's'})`,
      ),
    );
    console.log(chalk.gray(`Output: ${result.data.outputDir}`));

    if (result.data.tarballPath) {
      console.log(chalk.gray(`Tarball: ${result.data.tarballPath}`));
    }
  }
}
