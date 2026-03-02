import {
  APP_BUILD_AND_SYNC_STEPS,
  appBuildAndSync,
  type AppBuildAndSyncStep,
} from '@/cli/operations/app-build-and-sync';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import chalk from 'chalk';

const STEP_LABELS: Record<AppBuildAndSyncStep, string> = {
  [APP_BUILD_AND_SYNC_STEPS.MANIFEST]: 'Building manifest...',
  [APP_BUILD_AND_SYNC_STEPS.BUILD]: 'Building application files...',
  [APP_BUILD_AND_SYNC_STEPS.SYNC_SCHEMA]: 'Syncing application schema...',
  [APP_BUILD_AND_SYNC_STEPS.GENERATE_CLIENT]: 'Generating API client...',
  [APP_BUILD_AND_SYNC_STEPS.TYPECHECK]: 'Running typecheck...',
  [APP_BUILD_AND_SYNC_STEPS.REBUILD]: 'Rebuilding with generated client...',
  [APP_BUILD_AND_SYNC_STEPS.SYNC_FINAL]: 'Syncing built files...',
};

export type AppBuildCommandOptions = {
  appPath?: string;
};

export class AppBuildCommand {
  async execute(options: AppBuildCommandOptions): Promise<void> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    console.log(chalk.blue('Building and syncing application...'));
    console.log(chalk.gray(`App path: ${appPath}`));
    console.log('');

    const result = await appBuildAndSync({
      appPath,
      onStep: (step) => console.log(chalk.gray(STEP_LABELS[step])),
    });

    if (!result.success) {
      console.error(chalk.red(result.error.message));
      process.exit(1);
    }

    console.log(
      chalk.green(
        `✓ Build and sync succeeded (${result.data.fileCount} file${result.data.fileCount === 1 ? '' : 's'})`,
      ),
    );
  }
}
