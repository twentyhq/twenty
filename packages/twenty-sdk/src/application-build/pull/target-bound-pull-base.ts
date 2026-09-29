import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { isString } from '@sniptt/guards';
import { type Manifest } from 'twenty-shared/application';
import { isPlainObject, isValidUuid } from 'twenty-shared/utils';

import { assertPullPaths } from '@/application-build/pull/assert-pull-paths';
import {
  type AppPullTarget,
  type PullBaseStatus,
} from '@/application-build/pull/types';
import { isPullManifest } from '@/application-build/pull/validate-application-export';
import { PULL_BASE_FILE_PATH } from '@/cli/utilities/pull/pull-base-file';

export const normalizePullTarget = (target: AppPullTarget): AppPullTarget => {
  if (
    !isPlainObject(target) ||
    !isString(target.apiUrl) ||
    !isString(target.workspaceId) ||
    !isValidUuid(target.workspaceId)
  ) {
    throw new Error('Pull requires an API URL and workspace UUID.');
  }

  const apiUrl = new URL(target.apiUrl);

  if (
    !['http:', 'https:'].includes(apiUrl.protocol) ||
    apiUrl.username ||
    apiUrl.password ||
    apiUrl.search ||
    apiUrl.hash
  ) {
    throw new Error(
      'Pull requires an HTTP API URL without credentials, query or fragment.',
    );
  }

  return {
    apiUrl: apiUrl.toString().replace(/\/+$/, ''),
    workspaceId: target.workspaceId.toLowerCase(),
  };
};

export const readTargetBoundPullBase = async ({
  appPath,
  target,
  applicationUniversalIdentifier,
}: {
  appPath: string;
  target: AppPullTarget;
  applicationUniversalIdentifier: string;
}): Promise<{ status: PullBaseStatus; manifest: Manifest | null }> => {
  await assertPullPaths(appPath, [PULL_BASE_FILE_PATH]);

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
        base.manifest.application.universalIdentifier.toLowerCase()
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

    return { status: 'used', manifest: base.manifest };
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

export const createPullBaseWrite = ({
  target,
  manifest,
}: {
  target: AppPullTarget;
  manifest: Manifest;
}) => ({
  relativePath: PULL_BASE_FILE_PATH,
  content: `${JSON.stringify(
    {
      version: 2,
      target,
      applicationUniversalIdentifier: manifest.application.universalIdentifier,
      manifest,
    },
    null,
    2,
  )}\n`,
});
