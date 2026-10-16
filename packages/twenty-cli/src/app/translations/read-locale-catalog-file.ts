import path from 'node:path';
import { isPlainObject } from 'twenty-shared/utils';

import { readJson } from '@/app/fs-utils';

export const readLocaleCatalogFile = async ({
  filePath,
  onWarning,
}: {
  filePath: string;
  onWarning: (message: string) => void;
}): Promise<Record<string, unknown> | null> => {
  let parsed: unknown;

  try {
    parsed = await readJson<unknown>(filePath);
  } catch {
    onWarning(
      `Skipping translation file "${path.basename(filePath)}": it is not valid JSON.`,
    );

    return null;
  }

  if (!isPlainObject(parsed)) {
    onWarning(
      `Skipping translation file "${path.basename(filePath)}": expected a JSON object.`,
    );

    return null;
  }

  return parsed;
};
