import { resolve, sep } from 'path';

import * as tar from 'tar';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

export const MAX_EXTRACTED_SIZE_BYTES = 500 * 1024 * 1024;

export const extractTarballSecurely = async (
  tarballPath: string,
  targetDir: string,
): Promise<void> => {
  let totalExtractedSize = 0;
  const resolvedTarget = resolve(targetDir) + sep;

  await tar.extract({
    file: tarballPath,
    cwd: targetDir,
    filter: (entryPath, entry) => {
      const resolvedEntry = resolve(targetDir, entryPath);

      if (!resolvedEntry.startsWith(resolvedTarget)) {
        return false;
      }

      if ('type' in entry) {
        const entryType = entry.type;

        if (entryType === 'SymbolicLink' || entryType === 'Link') {
          return false;
        }
      }

      totalExtractedSize += entry.size ?? 0;

      if (totalExtractedSize > MAX_EXTRACTED_SIZE_BYTES) {
        throw new ApplicationException(
          `Extracted size exceeds ${MAX_EXTRACTED_SIZE_BYTES} bytes`,
          ApplicationExceptionCode.TARBALL_EXTRACTION_FAILED,
        );
      }

      return true;
    },
  });
};
