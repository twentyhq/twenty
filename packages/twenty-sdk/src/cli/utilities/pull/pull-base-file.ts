import {
  ensureDir,
  pathExists,
  readJson,
  writeJson,
} from '@/cli/utilities/file/fs-utils';
import { dirname, join } from 'node:path';
import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

export const PULL_BASE_FILE_PATH = '.twenty/pull-base.json';

const PULL_BASE_FILE_VERSION = 1;

type PullBaseFile = {
  version: number;
  applicationUniversalIdentifier: string;
  manifest: Manifest;
};

const isUsableBaseManifest = (manifest: unknown): manifest is Manifest => {
  if (!isDefined(manifest) || typeof manifest !== 'object') {
    return false;
  }

  const { application, objects, fields } = manifest as Partial<Manifest>;

  return (
    isDefined(application) &&
    typeof application.universalIdentifier === 'string' &&
    Array.isArray(objects) &&
    Array.isArray(fields)
  );
};

export const readPullBaseManifest = async ({
  appPath,
  applicationUniversalIdentifier,
}: {
  appPath: string;
  applicationUniversalIdentifier: string;
}): Promise<Manifest | null> => {
  const baseFilePath = join(appPath, PULL_BASE_FILE_PATH);

  if (!(await pathExists(baseFilePath))) {
    return null;
  }

  try {
    const baseFile = await readJson<PullBaseFile>(baseFilePath);

    if (
      baseFile.version !== PULL_BASE_FILE_VERSION ||
      baseFile.applicationUniversalIdentifier !==
        applicationUniversalIdentifier ||
      !isUsableBaseManifest(baseFile.manifest)
    ) {
      return null;
    }

    return baseFile.manifest;
  } catch {
    return null;
  }
};

export const writePullBaseManifest = async ({
  appPath,
  manifest,
}: {
  appPath: string;
  manifest: Manifest;
}): Promise<void> => {
  const baseFilePath = join(appPath, PULL_BASE_FILE_PATH);

  await ensureDir(dirname(baseFilePath));
  await writeJson(baseFilePath, {
    version: PULL_BASE_FILE_VERSION,
    applicationUniversalIdentifier: manifest.application.universalIdentifier,
    manifest,
  } satisfies PullBaseFile);
};
