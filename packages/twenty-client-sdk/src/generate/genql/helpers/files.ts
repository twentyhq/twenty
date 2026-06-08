import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';

export const ensurePath = async (path: string[], clear: boolean = false) => {
  const target = resolve(...path);
  if (clear) {
    await fs.rm(target, { recursive: true, force: true });
  }
  await fs.mkdir(target, { recursive: true });
};

export const writeFileToPath = async (path: string[], content: string) => {
  const folder = resolve(...path, '..');
  await fs.mkdir(folder, { recursive: true });
  await fs.writeFile(resolve(...path), content);
};
