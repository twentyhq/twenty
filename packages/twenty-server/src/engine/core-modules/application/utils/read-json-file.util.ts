import { promises as fs } from 'fs';
import { join } from 'path';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

export const readJsonFile = async <T>(
  dir: string,
  filename: string,
): Promise<T> => {
  const filePath = join(dir, filename);

  try {
    const content = await fs.readFile(filePath, 'utf-8');

    return JSON.parse(content) as T;
  } catch {
    throw new ApplicationException(
      `${filename} not found in resolved package`,
      ApplicationExceptionCode.PACKAGE_RESOLUTION_FAILED,
    );
  }
};
