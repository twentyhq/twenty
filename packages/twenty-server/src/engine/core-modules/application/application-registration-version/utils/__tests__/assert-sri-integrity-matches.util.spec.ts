import { assertSriIntegrityMatches } from 'src/engine/core-modules/application/application-registration-version/utils/assert-sri-integrity-matches.util';
import { ApplicationExceptionCode } from 'src/engine/core-modules/application/application.exception';

describe('assertSriIntegrityMatches', () => {
  it('accepts the recorded checksum', () => {
    expect(() =>
      assertSriIntegrityMatches({
        expected: 'sha512-same',
        actual: 'sha512-same',
        subject: 'Tarball',
      }),
    ).not.toThrow();
  });

  it.each(['sha512-first', null])(
    'rejects different or missing checksums: %s',
    (expected) => {
      expect(() =>
        assertSriIntegrityMatches({
          expected,
          actual: 'sha512-second',
          subject: 'Tarball',
        }),
      ).toThrow(
        expect.objectContaining({
          code: ApplicationExceptionCode.PACKAGE_INTEGRITY_MISMATCH,
        }),
      );
    },
  );
});
