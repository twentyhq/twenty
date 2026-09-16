import { ApplicationExceptionCode } from 'src/engine/core-modules/application/application.exception';
import {
  assertValidNpmVersionSpec,
  isValidNpmVersionSpec,
} from 'src/engine/core-modules/application/application-package/utils/is-valid-npm-version-spec.util';

describe('isValidNpmVersionSpec', () => {
  it.each([
    '1.2.3',
    '0.0.1-beta.4',
    '10.20.30-rc.1',
    '1.2.3+build.5',
    '1.2.3-rc.1+build.5',
  ])('should accept the exact semver version %s', (versionSpec) => {
    expect(isValidNpmVersionSpec(versionSpec)).toBe(true);
  });

  it.each(['latest', 'next', 'beta', 'v2-latest', 'canary_2024'])(
    'should accept the dist-tag %s',
    (versionSpec) => {
      expect(isValidNpmVersionSpec(versionSpec)).toBe(true);
    },
  );

  it.each([
    ['parent path segment', '../@other-scope/other-package/latest'],
    [
      'nested parent path segment',
      'latest/../../@other-scope/other-package/latest',
    ],
    ['slash', '1.2.3/extra'],
    [
      'percent-encoded parent path segment',
      '%2e%2e%2f@other-scope%2fother-package%2flatest',
    ],
    ['percent sign', '1%2E2%2E3'],
    ['whitespace', '1.2.3 '],
    ['newline', 'latest\n'],
    ['double dots in a tag', 'a..b'],
    ['leading dot', '.hidden'],
    ['leading dash', '-1.2.3'],
    ['semver range', '^1.2.3'],
    ['x-range', '1.x'],
    ['partial version', '1.2'],
    ['wildcard', 'x'],
    ['leading v', 'v1.2.3'],
    ['empty', ''],
    ['query string', 'latest?x=1'],
    ['hash', 'latest#frag'],
  ])('should reject %s (%s)', (_label, versionSpec) => {
    expect(isValidNpmVersionSpec(versionSpec)).toBe(false);
  });

  it('should reject an overly long spec', () => {
    expect(isValidNpmVersionSpec('a'.repeat(257))).toBe(false);
  });
});

describe('assertValidNpmVersionSpec', () => {
  it('should not throw for a valid spec', () => {
    expect(() => assertValidNpmVersionSpec('1.2.3')).not.toThrow();
  });

  it('should throw INVALID_INPUT for a spec containing path segments', () => {
    expect(() =>
      assertValidNpmVersionSpec('../@other-scope/other-package/latest'),
    ).toThrow(
      expect.objectContaining({
        code: ApplicationExceptionCode.INVALID_INPUT,
      }),
    );
  });
});
