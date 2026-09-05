import { appPull } from '@/cli/operations/pull';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import { formatPullReport } from '@/cli/utilities/pull/format-pull-report';
import { PULL_BASE_FILE_PATH } from '@/cli/utilities/pull/pull-base-file';
import { checkSdkVersionCompatibility } from '@/cli/utilities/version/check-sdk-version-compatibility';
import chalk from 'chalk';

export type AppPullCommandOptions = {
  appPath?: string;
  universalIdentifier?: string;
  verbose?: boolean;
};

export class AppPullCommand {
  async execute(options: AppPullCommandOptions): Promise<void> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    await checkSdkVersionCompatibility(appPath);

    const remoteName = ConfigService.getActiveRemote();

    console.log(
      chalk.yellow(
        '⚠ pull is experimental\n' +
          '  It covers only part of an application, and it overwrites the files\n' +
          '  that define what it pulls. Commit your work before running it.\n',
      ),
    );
    console.log(chalk.blue(`Pulling application from ${remoteName}...`));
    console.log(chalk.gray(`App path: ${appPath}\n`));

    const result = await appPull({
      appPath,
      universalIdentifier: options.universalIdentifier,
      onProgress: (message) => console.log(chalk.gray(message)),
    });

    if (!result.success) {
      console.error(chalk.red(result.error.message));
      process.exit(1);
    }

    const report = formatPullReport({
      writes: result.data.writes,
      deletions: result.data.deletions,
      unchangedCount: result.data.unchangedCount,
      skipped: result.data.skipped,
      coverage: result.data.coverage,
      localOnlyRelativePaths: result.data.localOnlyRelativePaths,
      unreadableRelativePaths: result.data.unreadableRelativePaths,
      verbose: options.verbose,
    });

    console.log(`\n${report}\n`);

    console.log(
      chalk.green(
        `✓ Pulled ${result.data.applicationDisplayName} into ${appPath}`,
      ),
    );
    console.log(chalk.gray(`Base recorded in ${PULL_BASE_FILE_PATH}`));
    console.log(chalk.gray('Next: yarn twenty plan --no-delete'));
  }
}
