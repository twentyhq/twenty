import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { assertPullPaths } from '@/application-build/pull/assert-pull-paths';
import { readApplicationIdentity } from '@/application-build/pull/read-application-identity';
import { normalizePullTarget } from '@/application-build/pull/target-bound-pull-base';
import { type PullAppOptions } from '@/application-build/pull/types';
import { validateApplicationExport } from '@/application-build/pull/validate-application-export';
import { PULL_BASE_FILE_PATH } from '@/cli/utilities/pull/pull-base-file';

export const prepareAppPull = async ({
  appPath,
  applicationExport,
  target,
  signal,
}: PullAppOptions) => {
  signal?.throwIfAborted();

  const exported = validateApplicationExport(applicationExport);
  const normalizedTarget = normalizePullTarget(target);

  await assertPullPaths(appPath, [PULL_BASE_FILE_PATH]);

  const packageJson: unknown = JSON.parse(
    await readFile(join(appPath, 'package.json'), 'utf8'),
  );

  if (!isPlainObject(packageJson)) {
    throw new Error('Pull requires a project with a package.json object.');
  }

  const identity = await readApplicationIdentity({ appPath, signal });

  if (!identity.success) {
    if (identity.error.code === 'CANCELLED') {
      signal?.throwIfAborted();
    }
    throw new Error(identity.error.message);
  }

  if (
    isDefined(identity.data.application) &&
    identity.data.application.universalIdentifier.toLowerCase() !==
      exported.application.universalIdentifier.toLowerCase()
  ) {
    throw new Error(
      `This project declares application ${identity.data.application.universalIdentifier}, but the export belongs to ${exported.application.universalIdentifier}. Pull it into a different directory.`,
    );
  }

  signal?.throwIfAborted();

  return { applicationExport: exported, target: normalizedTarget };
};
