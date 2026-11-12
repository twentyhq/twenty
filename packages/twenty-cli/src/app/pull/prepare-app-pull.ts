import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { PULL_BASE_FILE_PATH } from '@/app/constants/pull-base-file-path.constant';
import { parsePullFiles } from '@/app/pull/parse-pull-files';
import { assertPullPaths } from '@/app/pull/assert-pull-paths';
import { toPullManifest } from '@/app/pull/to-pull-manifest';
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

  const files = parsePullFiles({
    value: applicationExport.files,
    frontComponents:
      toPullManifest(applicationExport.manifest).frontComponents ?? [],
  });

  await assertPullPaths({
    appPath,
    relativePaths: [PULL_BASE_FILE_PATH, ...files.map((file) => file.path)],
  });

  const packageJson: unknown = JSON.parse(
    await readFile(join(appPath, 'package.json'), 'utf8'),
  );

  if (!isPlainObject(packageJson)) {
    throw new Error('Pull requires a project with a package.json object.');
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

  return {
    applicationExport: { ...applicationExport, files },
    target: normalizedTarget,
  };
};
