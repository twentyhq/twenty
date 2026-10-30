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
}: {
  tarballPath: string;
  targetDir: string;
}): Promise<void> =>
  new Promise((resolvePromise, rejectPromise) => {
    let totalExtractedSize = 0;
    const resolvedTarget = resolve(targetDir) + sep;
    const tarballStream = createReadStream(tarballPath);

    const unpackStream = tar.extract({
      cwd: targetDir,
      filter: (entryPath, entry) => {
        if (totalExtractedSize > MAX_EXTRACTED_SIZE_BYTES) {
          return false;
        }

        const resolvedEntry = resolve(targetDir, entryPath);

        if (!resolvedEntry.startsWith(resolvedTarget)) {
          return false;
        }

        if (
          'type' in entry &&
          (entry.type === 'SymbolicLink' || entry.type === 'Link')
        ) {
          return false;
        }

        totalExtractedSize += entry.size ?? 0;

        if (totalExtractedSize > MAX_EXTRACTED_SIZE_BYTES) {
          // Throwing here escapes tar's stream callback and kills the process
          tarballStream.destroy();
          rejectPromise(
            new ApplicationException(
              `Extracted size exceeds ${MAX_EXTRACTED_SIZE_BYTES} bytes`,
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
