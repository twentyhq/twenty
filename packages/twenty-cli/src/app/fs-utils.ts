import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  access,
  cp,
  mkdir,
  readdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';

import { hasErrorCode } from '@/utils/has-error-code';

export const pathExists = async (filePath: string): Promise<boolean> => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

export const ensureDir = (directoryPath: string) =>
  mkdir(directoryPath, { recursive: true });
export const copy = (source: string, destination: string) =>
  cp(source, destination, { recursive: true });
export const remove = (filePath: string) =>
  rm(filePath, { recursive: true, force: true });

export const emptyDir = async (dirPath: string): Promise<void> => {
  let entries: string[];

  try {
    entries = await readdir(dirPath);
  } catch (error: unknown) {
    if (hasErrorCode(error, 'ENOENT')) {
      await mkdir(dirPath, { recursive: true });
      return;
    }
    throw error;
  }

  await Promise.all(
    entries.map((entry) =>
      rm(join(dirPath, entry), { recursive: true, force: true }),
    ),
  );
};

export const pathExistsSync = (filePath: string): boolean =>
  existsSync(filePath);

export const writeJson = async (
  filePath: string,
  data: unknown,
): Promise<void> => {
  await writeFile(filePath, JSON.stringify(data, null, 2) + '\n');
};

export const readJson = async <TData = unknown>(
  filePath: string,
): Promise<TData> => JSON.parse(await readFile(filePath, 'utf-8')) as TData;
