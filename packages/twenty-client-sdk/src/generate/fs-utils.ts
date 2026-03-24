import { cp, mkdir, readdir, rename as fsRename, rm } from 'node:fs/promises';
import { join } from 'node:path';

export const ensureDir = (dirPath: string) =>
  mkdir(dirPath, { recursive: true });

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
