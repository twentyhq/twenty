import { readFile } from 'node:fs/promises';

import { isPlainObject } from 'twenty-shared/utils';

export const readJsonObject = async (filePath: string) => {
  try {
    const value: unknown = JSON.parse(await readFile(filePath, 'utf8'));

    return isPlainObject(value) ? value : undefined;
  } catch {
    return undefined;
  }
};
