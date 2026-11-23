import { isArray, isNonEmptyString } from '@sniptt/guards';
import { basename } from 'node:path';
import { isPlainObject } from 'twenty-shared/utils';

import { CliError } from '@/output/cli-error';

type NpmPackOutput = {
  name: string;
  version: string;
  filename: string;
  files: { path: string }[];
};

// npm 12 keys the packed packages by name instead of listing them.
const getSinglePackedPackage = (result: unknown): unknown => {
  const packages = isPlainObject(result) ? Object.values(result) : result;

  return isArray(packages) && packages.length === 1 ? packages[0] : undefined;
};

export const parseNpmPackOutputOrThrow = (stdout: string): NpmPackOutput => {
  let result: unknown;

  try {
    result = JSON.parse(stdout);
  } catch (cause) {
    throw new CliError({
      code: 'PUBLISH_FAILED',
      message: 'npm pack returned invalid JSON.',
      cause,
    });
  }

  const packed = getSinglePackedPackage(result);

  if (
    !isPlainObject(packed) ||
    !isNonEmptyString(packed.name) ||
    !isNonEmptyString(packed.version) ||
    !isNonEmptyString(packed.filename) ||
    basename(packed.filename) !== packed.filename ||
    packed.filename.includes('\\') ||
    !packed.filename.endsWith('.tgz') ||
    !isArray(packed.files)
  ) {
    throw new CliError({
      code: 'PUBLISH_FAILED',
      message: 'npm pack returned an invalid package description.',
    });
  }

  const files = packed.files.map((file) => {
    if (!isPlainObject(file) || !isNonEmptyString(file.path)) {
      throw new CliError({
        code: 'PUBLISH_FAILED',
        message: 'npm pack returned an invalid package file.',
      });
    }
    return { path: file.path };
  });

  return {
    name: packed.name,
    version: packed.version,
    filename: packed.filename,
    files,
  };
};
