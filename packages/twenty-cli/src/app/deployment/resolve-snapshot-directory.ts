import { join } from 'node:path';

import { isDefined } from 'twenty-shared/utils';

import { type ToolingBuild } from '@/app/types/tooling-result.type';
import { CliError } from '@/output/cli-error';
import { isInsideDirectory } from '@/utils/is-inside-directory';

export const resolveSnapshotDirectory = ({
  build,
  appPath,
}: {
  build: ToolingBuild;
  appPath: string;
}) => {
  if (!isDefined(build.directory)) {
    throw new CliError({
      code: 'SNAPSHOT_INVALID',
      message:
        'The build did not report its snapshot directory, so the CLI cannot upload it.',
    });
  }

  if (
    !isInsideDirectory({
      filePath: build.directory,
      directory: join(appPath, '.twenty', 'cli', 'snapshots'),
    })
  ) {
    throw new CliError({
      code: 'SNAPSHOT_INVALID',
      message: `The build snapshot ${build.directory} is outside the app's .twenty/cli/snapshots folder.`,
      details: { directory: build.directory },
    });
  }

  return build.directory;
};
