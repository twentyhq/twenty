// ESM-native helpers that have no direct native fs equivalent.
// For standard fs operations (readFile, writeFile, mkdir, etc.),
// import directly from 'node:fs/promises' or 'node:fs'.
import {
  access,
  cp,
  mkdir,
  readFile,
  readdir,
  rename as fsRename,
  rm,
  writeFile,
} from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const pathExists = async (filePath: string): Promise<boolean> => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

export const pathExistsSync = (filePath: string): boolean =>
  existsSync(filePath);

export const ensureDir = (dirPath: string) =>
  mkdir(dirPath, { recursive: true });

export const ensureFile = async (filePath: string): Promise<void> => {
  await mkdir(dirname(filePath), { recursive: true });

  try {
    await access(filePath);
  } catch {
    await writeFile(filePath, '');
  }
};

export const emptyDir = async (dirPath: string): Promise<void> => {
  let entries: string[];

  try {
    entries = await readdir(dirPath);
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
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

export const copy = (src: string, dest: string) =>
  cp(src, dest, { recursive: true });

// Falls back to copy+delete when rename fails across devices
export const move = async (src: string, dest: string): Promise<void> => {
  try {
    await fsRename(src, dest);
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'EXDEV') {
      await cp(src, dest, { recursive: true });
      await rm(src, { recursive: true, force: true });
    } else {
      throw error;
    }
  }
};

export const remove = (filePath: string) =>
  rm(filePath, { recursive: true, force: true });

export const readJson = async <T = unknown>(filePath: string): Promise<T> => {
  const content = await readFile(filePath, 'utf-8');

  return JSON.parse(content) as T;
};

export const writeJson = async (
  filePath: string,
  data: unknown,
): Promise<void> => {
  await writeFile(filePath, JSON.stringify(data, null, 2) + '\n');
};
