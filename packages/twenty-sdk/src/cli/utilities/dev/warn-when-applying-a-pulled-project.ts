import chalk from 'chalk';

import { hasPullBaseFile } from '@/cli/utilities/pull/pull-base-file';

export const warnWhenApplyingAPulledProject = async ({
  appPath,
  isApplying,
  infersDeletionFromMissingEntities,
}: {
  appPath: string;
  isApplying: boolean;
  infersDeletionFromMissingEntities: boolean;
}): Promise<void> => {
  if (!isApplying || !infersDeletionFromMissingEntities) {
    return;
  }

  if (!(await hasPullBaseFile({ appPath }))) {
    return;
  }

  console.log(
    chalk.yellow(
      'This project was written by `twenty pull`, which is experimental and cannot export every entity yet.',
    ),
  );
  console.log(
    chalk.yellow(
      'Entities it could not write are missing from your source, so applying will destroy them in the workspace.',
    ),
  );
  console.log(chalk.yellow('Re-run with --no-delete to keep them.\n'));
};
