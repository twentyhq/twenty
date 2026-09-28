// ESM-native helpers that have no direct native fs equivalent.
// For standard fs operations (readFile, writeFile, mkdir, etc.),
// import directly from 'node:fs/promises' or 'node:fs'.
import {
  access,
  cp,
  mkdir,
  open,
  readFile,
  readdir,
  rename as fsRename,
  rm,
  writeFile,
} from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

const PRIVATE_DIRECTORY_MODE = 0o700;

const PRIVATE_FILE_MODE = 0o600;

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

export const ensurePrivateDir = (dirPath: string) =>
  mkdir(dirPath, { recursive: true, mode: PRIVATE_DIRECTORY_MODE });

export const ensurePrivateFile = async (filePath: string): Promise<void> => {
  await ensurePrivateDir(dirname(filePath));

  try {
    await access(filePath);
  } catch {
    await writeFile(filePath, '', { mode: PRIVATE_FILE_MODE });
  }
};

export const writePrivateFile = async (
  filePath: string,
  content: string,
): Promise<void> => {
  await ensurePrivateDir(dirname(filePath));

  const fileHandle = await open(filePath, 'w', PRIVATE_FILE_MODE);

  try {
    await fileHandle.chmod(PRIVATE_FILE_MODE).catch(() => undefined);
    await fileHandle.writeFile(content);
  } finally {
    await fileHandle.close();
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
