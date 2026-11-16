import { createHash } from 'crypto';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

export const assertMatchingTarballIntegrity = ({
  tarball,
  integrity,
}: {
  tarball: Buffer;
  integrity: string;
}): void => {
  const actualSha512 = `sha512-${createHash('sha512').update(tarball).digest('base64')}`;

  if (!integrity.split(/\s+/).includes(actualSha512)) {
    throw new ApplicationException(
      'Downloaded tarball does not match the expected sha512 integrity',
      ApplicationExceptionCode.PACKAGE_RESOLUTION_FAILED,
    );
  }
};
