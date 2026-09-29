import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { isArray, isString } from '@sniptt/guards';
import { type Manifest } from 'twenty-shared/application';
import { isDefined, isPlainObject, isValidUuid } from 'twenty-shared/utils';

import { assertPullPaths } from '@/application-build/pull/assert-pull-paths';
import { normalizePullTarget } from '@/application-build/pull/normalize-pull-target';
import {
  type AppPullTarget,
  type PullBaseStatus,
} from '@/application-build/pull/types';
import { isPullManifest } from '@/application-build/pull/validate-application-export';
import { PULL_BASE_FILE_PATH } from '@/cli/utilities/pull/pull-base-file';

export const readTargetBoundPullBase = async ({
  appPath,
  target,
  applicationUniversalIdentifier,
}: {
  appPath: string;
  target: AppPullTarget;
  applicationUniversalIdentifier: string;
}): Promise<{
  status: PullBaseStatus;
  manifest: Manifest | null;
  unreconciledUniversalIdentifiers?: string[];
}> => {
  await assertPullPaths({ appPath, relativePaths: [PULL_BASE_FILE_PATH] });

  try {
    const base: unknown = JSON.parse(
      await readFile(join(appPath, PULL_BASE_FILE_PATH), 'utf8'),
    );

    if (isPlainObject(base) && base.version === 1) {
      return { status: 'unbound', manifest: null };
    }

    if (
      !isPlainObject(base) ||
      base.version !== 2 ||
      !isPlainObject(base.target) ||
      !isString(base.target.apiUrl) ||
      !isString(base.target.workspaceId) ||
      !isString(base.applicationUniversalIdentifier) ||
      !isPullManifest(base.manifest) ||
      base.applicationUniversalIdentifier.toLowerCase() !==
        base.manifest.application.universalIdentifier.toLowerCase() ||
      (isDefined(base.unreconciledUniversalIdentifiers) &&
        (!isArray(base.unreconciledUniversalIdentifiers) ||
          !base.unreconciledUniversalIdentifiers.every(
            (identifier) => isString(identifier) && isValidUuid(identifier),
          )))
    ) {
      return { status: 'unreadable', manifest: null };
    }

    const baseTarget = normalizePullTarget({
      apiUrl: base.target.apiUrl,
      workspaceId: base.target.workspaceId,
    });

    if (
      baseTarget.apiUrl !== target.apiUrl ||
      baseTarget.workspaceId !== target.workspaceId ||
      base.applicationUniversalIdentifier.toLowerCase() !==
        applicationUniversalIdentifier.toLowerCase()
    ) {
      return { status: 'other-target', manifest: null };
    }

    return {
      status: 'used',
      manifest: base.manifest,
      unreconciledUniversalIdentifiers: base.unreconciledUniversalIdentifiers
        ?.filter(isString)
        .map((identifier) => identifier.toLowerCase()),
    };
  } catch (error) {
    return {
      status:
        error instanceof Error && 'code' in error && error.code === 'ENOENT'
          ? 'missing'
          : 'unreadable',
      manifest: null,
    };
  }
};
