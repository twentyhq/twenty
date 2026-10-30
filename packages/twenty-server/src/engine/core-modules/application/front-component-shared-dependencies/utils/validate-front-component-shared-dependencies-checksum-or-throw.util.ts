import { createHash } from 'crypto';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

export const validateFrontComponentSharedDependenciesChecksumOrThrow = ({
  source,
  checksum,
}: {
  source: string;
  checksum: string;
}): void => {
  if (createHash('sha256').update(source).digest('hex') !== checksum) {
    throw new ApplicationException(
      'Shared dependencies checksum mismatch',
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }
};
