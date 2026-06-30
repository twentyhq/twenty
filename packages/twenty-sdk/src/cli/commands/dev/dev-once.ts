import { appDevOnce } from '@/cli/operations/dev-once';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import { checkSdkVersionCompatibility } from '@/cli/utilities/version/check-sdk-version-compatibility';
import chalk from 'chalk';

export type AppDevOnceCommandOptions = {
  appPath?: string;
  verbose?: boolean;
  dryRun?: boolean;
};

export class AppDevOnceCommand {
  async execute(options: AppDevOnceCommandOptions): Promise<void> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    await checkSdkVersionCompatibility(appPath);

    const remoteName = ConfigService.getActiveRemote();

    console.log(
      chalk.blue(
        `${options.dryRun ? 'Previewing application diff' : 'Syncing application'} on ${remoteName}...`,
      ),
    );
    console.log(chalk.gray(`App path: ${appPath}\n`));

    const result = await appDevOnce({
      appPath,
      verbose: options.verbose,
      dryRun: options.dryRun,
      onProgress: (message) => console.log(chalk.gray(message)),
    });

    if (!result.success) {
      console.error(chalk.red(result.error.message));
      process.exit(1);
    }

    if (options.dryRun) {
      console.log(
        chalk.green(
          `\n✓ Dry run complete for ${result.data.applicationDisplayName} — no changes were applied`,
        ),
      );

      return;
    }

    console.log(
      chalk.green(
        `\n✓ Synced ${result.data.applicationDisplayName} (${result.data.fileCount} file${result.data.fileCount === 1 ? '' : 's'})`,
      ),
    );
    console.log(chalk.gray(`Output: ${result.data.outputDir}`));
  }
}
