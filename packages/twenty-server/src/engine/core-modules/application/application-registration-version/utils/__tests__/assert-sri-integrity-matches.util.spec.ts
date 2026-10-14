import { assertSriIntegrityMatches } from 'src/engine/core-modules/application/application-registration-version/utils/assert-sri-integrity-matches.util';
import { computeSriIntegrity } from 'src/engine/core-modules/application/application-registration-version/utils/compute-sri-integrity.util';
import { computeSupportedSriIntegrity } from 'src/engine/core-modules/application/application-registration-version/utils/compute-supported-sri-integrity.util';
import { ApplicationExceptionCode } from 'src/engine/core-modules/application/application.exception';

describe('assertSriIntegrityMatches', () => {
  const content = Buffer.from('twenty');
  const actual = computeSupportedSriIntegrity(content);
  const subject = 'Package resolved for app@1.0.0';

  it('accepts bytes matching the expected fingerprint', () => {
    expect(() =>
      assertSriIntegrityMatches({
        expected: computeSriIntegrity({ source: content, algorithm: 'sha256' }),
        actual,
        subject,
      }),
    ).not.toThrow();
  });

  it('rejects bytes that differ from the expected fingerprint', () => {
    expect(() =>
      assertSriIntegrityMatches({
        expected: computeSriIntegrity({
          source: Buffer.from('tampered'),
          algorithm: 'sha256',
        }),
        actual,
        subject,
      }),
    ).toThrow(
      expect.objectContaining({
        code: ApplicationExceptionCode.PACKAGE_INTEGRITY_MISMATCH,
      }),
    );
  });

  it('lets bytes through when the expected fingerprint only uses unsupported algorithms', () => {
    expect(() =>
      assertSriIntegrityMatches({
        expected: 'sha1-AAAAAAAAAAAAAAAAAAAAAAAAAAA=',
        actual,
        subject,
      }),
    ).not.toThrow();
  });
});
