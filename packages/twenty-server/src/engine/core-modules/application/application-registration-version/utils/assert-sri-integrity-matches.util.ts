import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

export const assertSriIntegrityMatches = ({
  expected,
  actual,
  subject,
}: {
  expected: string;
  actual: string;
  subject: string;
}): void => {
  if (!expected.split(/\s+/).includes(actual)) {
    throw new ApplicationException(
      `${subject} does not match its expected sha512 fingerprint`,
      ApplicationExceptionCode.PACKAGE_INTEGRITY_MISMATCH,
    );
  }
};
