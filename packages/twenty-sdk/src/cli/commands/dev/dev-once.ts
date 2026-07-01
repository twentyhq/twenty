import { appDevOnce } from '@/cli/operations/dev-once';
import { APP_ERROR_CODES } from '@/cli/types';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import { confirmDestructiveApply } from '@/cli/utilities/dev/confirm-destructive-apply';
import { checkSdkVersionCompatibility } from '@/cli/utilities/version/check-sdk-version-compatibility';
import chalk from 'chalk';

export type AppDevOnceCommandOptions = {
  appPath?: string;
  verbose?: boolean;
  apply?: boolean;
  force?: boolean;
};

export class AppDevOnceCommand {
  async execute(options: AppDevOnceCommandOptions): Promise<void> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;
    const apply = options.apply ?? false;

    await checkSdkVersionCompatibility(appPath);

    const remoteName = ConfigService.getActiveRemote();

    console.log(
      chalk.blue(
        `${apply ? 'Applying application manifest' : 'Planning application apply'} on ${remoteName}...`,
      ),
    );
    console.log(chalk.gray(`App path: ${appPath}\n`));

    const result = await appDevOnce({
      appPath,
      verbose: options.verbose,
      apply,
      force: options.force,
      onProgress: (message) => console.log(chalk.gray(message)),
      onPlan: (text) => console.log(`\n${text}\n`),
      confirmApply: (deleteCount) =>
        confirmDestructiveApply(deleteCount, { force: options.force }),
    });

    if (!result.success) {
      if (result.error.code === APP_ERROR_CODES.APPLY_ABORTED) {
        console.log(chalk.yellow(result.error.message));
        process.exit(1);
      }

      console.error(chalk.red(result.error.message));
      process.exit(1);
    }

    if (!apply) {
      console.log(
        chalk.green(
          `\n✓ Plan complete for ${result.data.applicationDisplayName} — no changes were applied`,
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
