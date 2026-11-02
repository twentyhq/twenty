import { isArray, isString } from '@sniptt/guards';
import { FileFolder } from 'twenty-shared/types';
import { isPlainObject } from 'twenty-shared/utils';

import { type AppExportFile } from '@/app/types/app-export.type';
import { CliError } from '@/output/cli-error';

const isPackageJsonObject = (content: string): boolean => {
  try {
    return isPlainObject(JSON.parse(content));
  } catch {
    return false;
  }
};

export const parsePullDependencyFiles = (value: unknown): AppExportFile[] => {
  if (!isArray(value)) {
    throw new CliError({
      code: 'INVALID_RESPONSE',
      message: 'The exported files must be an array.',
    });
  }

  const files: AppExportFile[] = [];
  const paths = new Set<string>();

  for (const file of value) {
    if (
      !isPlainObject(file) ||
      !isString(file.folder) ||
      !isString(file.path) ||
      !isString(file.content)
    ) {
      throw new CliError({
        code: 'INVALID_RESPONSE',
        message: 'The server returned an invalid exported file.',
      });
    }

    if (
      file.folder !== FileFolder.Dependencies ||
      !['package.json', 'yarn.lock'].includes(file.path)
    ) {
      throw new CliError({
        code: 'TOOLING_UNSUPPORTED',
        message:
          'This CLI can only pull package.json and yarn.lock from the dependencies folder. No local files were changed.',
      });
    }

    if (paths.has(file.path)) {
      throw new CliError({
        code: 'INVALID_RESPONSE',
        message: `The server exported ${file.path} more than once.`,
      });
    }

    if (file.path === 'package.json' && !isPackageJsonObject(file.content)) {
      throw new CliError({
        code: 'INVALID_RESPONSE',
        message: 'The exported package.json must contain a JSON object.',
      });
    }

    paths.add(file.path);
    files.push({ folder: file.folder, path: file.path, content: file.content });
  }

  return files;
};
