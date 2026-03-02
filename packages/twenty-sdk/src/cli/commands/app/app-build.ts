import { appBuild } from '@/cli/operations/app-build';
import { syncBuiltApp } from '@/cli/operations/app-sync';
import { buildAndValidateManifest } from '@/cli/utilities/build/manifest/build-and-validate-manifest';
import { ClientService } from '@/cli/utilities/client/client-service';
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

    const manifestResult = await buildAndValidateManifest(appPath);

    if (!manifestResult.success) {
      console.error(chalk.red('Manifest build failed:'));

      for (const error of manifestResult.errors) {
        console.error(chalk.red(`  ${error}`));
      }

      process.exit(1);
    }

    const { manifest, filePaths } = manifestResult;
    const clientService = new ClientService();

    try {
      await clientService.ensureGeneratedClientStub({ appPath });

      console.log(chalk.gray('Building application files...'));

      const firstBuildResult = await appBuild({
        appPath,
        manifest,
        filePaths,
      });

      console.log(chalk.gray('Syncing application schema...'));

      const firstSyncResult = await syncBuiltApp({
        appPath,
        manifest,
        builtFileInfos: firstBuildResult.builtFileInfos,
      });

      if (!firstSyncResult.success) {
        console.error(
          chalk.red(`Schema sync failed: ${firstSyncResult.error.message}`),
        );
        process.exit(1);
      }

      console.log(chalk.gray('Generating API client...'));

      await clientService.generate({ appPath });

      console.log(chalk.gray('Rebuilding with generated client...'));

      const finalBuildResult = await appBuild({
        appPath,
        manifest,
        filePaths,
      });

      console.log(chalk.gray('Syncing built files...'));

      const finalSyncResult = await syncBuiltApp({
        appPath,
        manifest,
        builtFileInfos: finalBuildResult.builtFileInfos,
      });

      if (!finalSyncResult.success) {
        console.error(
          chalk.red(`Final sync failed: ${finalSyncResult.error.message}`),
        );
        process.exit(1);
      }

      const fileCount = finalBuildResult.builtFileInfos.size;

      console.log(
        chalk.green(
          `✓ Build and sync succeeded (${fileCount} file${fileCount === 1 ? '' : 's'})`,
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
