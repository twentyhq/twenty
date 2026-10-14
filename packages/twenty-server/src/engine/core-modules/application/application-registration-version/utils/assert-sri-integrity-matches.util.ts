import { Logger } from '@nestjs/common';

import { compareSriIntegrity } from 'src/engine/core-modules/application/application-registration-version/utils/compare-sri-integrity.util';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

const logger = new Logger('assertSriIntegrityMatches');

export const assertSriIntegrityMatches = ({
  expected,
  actual,
  subject,
}: {
  expected: string;
  actual: string;
  subject: string;
}): void => {
  const comparison = compareSriIntegrity({ expected, actual });

  if (comparison === 'mismatch') {
    throw new ApplicationException(
      `${subject} does not match its expected fingerprint`,
      ApplicationExceptionCode.PACKAGE_INTEGRITY_MISMATCH,
    );
  }

  if (comparison === 'incomparable') {
    logger.warn(
      `Expected fingerprint of ${subject} uses an algorithm this server cannot verify`,
    );
  }
};
