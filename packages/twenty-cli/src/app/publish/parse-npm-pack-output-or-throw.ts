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

export const parseNpmPackOutputOrThrow = (stdout: string): NpmPackOutput => {
  try {
    const result: unknown = JSON.parse(stdout);
    const packed =
      isArray(result) && result.length === 1 ? result[0] : undefined;

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
      throw new Error('Invalid npm package description');
    }

    const files = packed.files.map((file) => {
      if (!isPlainObject(file) || !isNonEmptyString(file.path)) {
        throw new Error('Invalid npm package file');
      }
      return { path: file.path };
    });

    return {
      name: packed.name,
      version: packed.version,
      filename: packed.filename,
      files,
    };
  } catch (cause) {
    throw new CliError({
      code: 'PUBLISH_FAILED',
      message: 'npm pack returned an invalid package description.',
      cause,
    });
  }
};
