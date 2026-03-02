import { appBuild } from '@/cli/operations/app-build';
import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';
import { manifestValidate } from '@/cli/utilities/build/manifest/manifest-validate';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import chalk from 'chalk';

export type AppBuildCommandOptions = {
  appPath?: string;
};

export class AppBuildCommand {
  async execute(options: AppBuildCommandOptions): Promise<void> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    console.log(chalk.blue('Building application...'));
    console.log(chalk.gray(`App path: ${appPath}`));
    console.log('');

    const manifestResult = await buildManifest(appPath);

    if (manifestResult.errors.length > 0 || !manifestResult.manifest) {
      console.error(chalk.red('Manifest build failed:'));

      for (const error of manifestResult.errors) {
        console.error(chalk.red(`  ${error}`));
      }

      process.exit(1);
    }

    const validation = manifestValidate(manifestResult.manifest);

    if (!validation.isValid) {
      console.error(chalk.red('Manifest validation failed:'));

      for (const error of validation.errors) {
        console.error(chalk.red(`  ${error}`));
      }

      process.exit(1);
    }

    try {
      const result = await appBuild({
        appPath,
        manifest: manifestResult.manifest,
        filePaths: manifestResult.filePaths,
      });

      const fileCount = result.builtFileInfos.size;

      console.log(
        chalk.green(
          `✓ Build succeeded (${fileCount} file${fileCount === 1 ? '' : 's'})`,
        ),
      );
    } catch (error) {
      console.error(
        chalk.red('Build failed:'),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }
}
