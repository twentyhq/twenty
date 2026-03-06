import { promises as fs } from 'fs';
import { join } from 'path';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

export const readJsonFile = async <T>(
  dir: string,
  filename: string,
): Promise<T | null> => {
  const filePath = join(dir, filename);

  try {
    const content = await fs.readFile(filePath, 'utf-8');

    return JSON.parse(content) as T;
  } catch {
    return null;
  }
};

export const readJsonFileOrThrow = async <T>(
  dir: string,
  filename: string,
): Promise<T> => {
  const result = await readJsonFile<T>(dir, filename);

  if (result === null) {
    throw new ApplicationException(
      `${filename} not found or invalid in resolved package`,
      ApplicationExceptionCode.PACKAGE_RESOLUTION_FAILED,
    );
  }

  return result;
};
