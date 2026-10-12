import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { PULL_BASE_FILE_PATH } from '@/app/constants/pull-base-file-path.constant';
import { assertPullPaths } from '@/app/pull/assert-pull-paths';
import { normalizePullTarget } from '@/app/pull/normalize-pull-target';
import { type PullAppOptions } from '@/app/pull/types';
import { readApplicationIdentity } from '@/app/source/read-application-identity';

export const prepareAppPull = async ({
  appPath,
  applicationExport,
  target,
  signal,
}: PullAppOptions) => {
  signal.throwIfAborted();

  const normalizedTarget = normalizePullTarget(target);

  await assertPullPaths({ appPath, relativePaths: [PULL_BASE_FILE_PATH] });

  const packageJson: unknown = JSON.parse(
    await readFile(join(appPath, 'package.json'), 'utf8'),
  );

  if (!isPlainObject(packageJson)) {
    throw new Error('Pull requires a project with a package.json object.');
  }

  if (applicationExport.files.length > 0) {
    throw new Error(
      'This CLI cannot reconcile exported source or dependency files.',
    );
  }

  const identity = await readApplicationIdentity({ appPath, signal });

  if (
    isDefined(identity.application) &&
    identity.application.universalIdentifier.toLowerCase() !==
      applicationExport.application.universalIdentifier.toLowerCase()
  ) {
    throw new Error(
      `This project declares application ${identity.application.universalIdentifier}, but the export belongs to ${applicationExport.application.universalIdentifier}. Pull it into a different directory.`,
    );
  }
  signal.throwIfAborted();

  return { applicationExport, target: normalizedTarget };
};
