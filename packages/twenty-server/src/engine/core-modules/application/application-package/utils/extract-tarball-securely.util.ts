import { createReadStream } from 'fs';
import { resolve, sep } from 'path';

import * as tar from 'tar';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

export const MAX_EXTRACTED_SIZE_BYTES = 500 * 1024 * 1024;

export const extractTarballSecurely = ({
  tarballPath,
  targetDir,
  maxExtractedSizeBytes = MAX_EXTRACTED_SIZE_BYTES,
}: {
  tarballPath: string;
  targetDir: string;
  maxExtractedSizeBytes?: number;
}): Promise<void> =>
  new Promise((resolvePromise, rejectPromise) => {
    let totalExtractedSize = 0;
    let hasExceededMaxExtractedSize = false;
    const resolvedTarget = resolve(targetDir) + sep;
    const tarballStream = createReadStream(tarballPath);

    const unpackStream = tar.extract({
      cwd: targetDir,
      filter: (entryPath, entry) => {
        if (hasExceededMaxExtractedSize) {
          return false;
        }

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

        if (totalExtractedSize > maxExtractedSizeBytes) {
          hasExceededMaxExtractedSize = true;
          // Throwing here escapes tar's stream callback and kills the process
          tarballStream.destroy();
          rejectPromise(
            new ApplicationException(
              `Extracted size exceeds ${maxExtractedSizeBytes} bytes`,
              ApplicationExceptionCode.TARBALL_EXTRACTION_FAILED,
            ),
          );

          return false;
        }

        return true;
      },
    });

    tarballStream.on('error', rejectPromise);
    unpackStream.on('error', rejectPromise);
    unpackStream.on('close', () => resolvePromise());
    tarballStream.pipe(unpackStream);
  });
