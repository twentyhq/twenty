import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { isArray, isString } from '@sniptt/guards';
import { isValidUniversalIdentifier } from 'twenty-shared/application';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { PULL_BASE_FILE_PATH } from '@/app/constants/pull-base-file-path.constant';
import { assertPullPaths } from '@/app/pull/assert-pull-paths';
import { normalizePullTarget } from '@/app/pull/normalize-pull-target';
import { isExportedManifest } from '@/app/pull/is-exported-manifest';
import { isSourceFingerprints } from '@/app/pull/is-source-fingerprints';
import { type ExportedManifest } from '@/app/types/exported-manifest.type';
import { type PullTarget } from '@/app/types/pull-target.type';
import { hasErrorCode } from '@/utils/has-error-code';

export const readTargetBoundPullBase = async ({
  appPath,
  target,
  applicationUniversalIdentifier,
}: {
  appPath: string;
  target: PullTarget;
  applicationUniversalIdentifier: string;
}): Promise<{
  status: 'used' | 'missing' | 'other-target' | 'unbound' | 'unreadable';
  manifest: ExportedManifest | null;
  unreconciledUniversalIdentifiers?: string[];
  sourceFingerprints?: Record<string, string>;
}> => {
  await assertPullPaths({ appPath, relativePaths: [PULL_BASE_FILE_PATH] });

  const normalizedTarget = normalizePullTarget(target);

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
      !isExportedManifest(base.manifest) ||
      base.applicationUniversalIdentifier.toLowerCase() !==
        base.manifest.application.universalIdentifier.toLowerCase() ||
      (isDefined(base.unreconciledUniversalIdentifiers) &&
        (!isArray(base.unreconciledUniversalIdentifiers) ||
          !base.unreconciledUniversalIdentifiers.every(
            (identifier) =>
              isString(identifier) && isValidUniversalIdentifier(identifier),
          ))) ||
      (isDefined(base.sourceFingerprints) &&
        !isSourceFingerprints(base.sourceFingerprints))
    ) {
      return { status: 'unreadable', manifest: null };
    }

    const baseTarget = normalizePullTarget({
      apiUrl: base.target.apiUrl,
      workspaceId: base.target.workspaceId,
    });

    if (
      baseTarget.apiUrl !== normalizedTarget.apiUrl ||
      baseTarget.workspaceId !== normalizedTarget.workspaceId ||
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
      sourceFingerprints: isSourceFingerprints(base.sourceFingerprints)
        ? base.sourceFingerprints
        : undefined,
    };
  } catch (error) {
    return {
      status: hasErrorCode(error, 'ENOENT') ? 'missing' : 'unreadable',
      manifest: null,
    };
  }
};
