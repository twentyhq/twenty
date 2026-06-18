import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';

export const getEngineVersionRange = (
  cwd: string = CURRENT_EXECUTION_DIRECTORY,
): string | null => {
  try {
    const pkg = JSON.parse(
      readFileSync(join(cwd, 'package.json'), 'utf-8'),
    ) as { engines?: { twenty?: unknown } };

    const range = pkg.engines?.twenty;

    return typeof range === 'string' && range.trim() !== ''
      ? range.trim()
      : null;
  } catch {
    return null;
  }
};
