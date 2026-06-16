import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';

// Reads the server version an app pins in its package.json under `twenty.serverVersion`.
// Lets each generated app declare which Twenty server image it runs against, as code.
// Returns null when no package.json, no field, or an empty value is found.
export const getAppServerVersion = (
  cwd: string = CURRENT_EXECUTION_DIRECTORY,
): string | null => {
  try {
    const pkg = JSON.parse(
      readFileSync(join(cwd, 'package.json'), 'utf-8'),
    ) as { twenty?: { serverVersion?: string } };

    const serverVersion = pkg.twenty?.serverVersion?.trim();

    return serverVersion ? serverVersion : null;
  } catch {
    return null;
  }
};
