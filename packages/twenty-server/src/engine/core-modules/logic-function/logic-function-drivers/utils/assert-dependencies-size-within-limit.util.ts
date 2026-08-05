import { promises as fs } from 'fs';
import { join } from 'path';

import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

const computeDirectorySizeBytes = async (
  directory: string,
): Promise<number> => {
  const entries = await fs.readdir(directory, { withFileTypes: true });

  const sizes = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(directory, entry.name);

      if (entry.isDirectory()) {
        return computeDirectorySizeBytes(fullPath);
      }

      // Count symlinked file targets (e.g. node_modules/.bin entries) but do
      // not recurse into symlinked directories to avoid cycles.
      if (entry.isSymbolicLink()) {
        try {
          const targetStat = await fs.stat(fullPath);

          return targetStat.isFile() ? targetStat.size : 0;
        } catch {
          return 0;
        }
      }

      if (!entry.isFile()) {
        return 0;
      }

      const stat = await fs.stat(fullPath);

      return stat.size;
    }),
  );

  return sizes.reduce((total, size) => total + size, 0);
};

export const assertDependenciesSizeWithinLimit = async ({
  directory,
  maxSizeMb,
}: {
  directory: string;
  maxSizeMb: number;
}): Promise<void> => {
  const sizeBytes = await computeDirectorySizeBytes(directory);
  const sizeMb = Math.ceil(sizeBytes / (1024 * 1024));

  if (sizeMb > maxSizeMb) {
    throw new LogicFunctionException(
      `Dependencies size exceeded: production dependencies unpack to ${sizeMb}MB, the maximum is ${maxSizeMb}MB. Move packages that are not imported by your logic functions (UI libraries, dev tooling) out of "dependencies".`,
      LogicFunctionExceptionCode.LOGIC_FUNCTION_DEPENDENCIES_SIZE_EXCEEDED,
    );
  }
};
