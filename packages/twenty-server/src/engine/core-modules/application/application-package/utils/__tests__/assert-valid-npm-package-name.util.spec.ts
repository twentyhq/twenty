import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { assertValidNpmPackageName } from 'src/engine/core-modules/application/application-package/utils/assert-valid-npm-package-name.util';

describe('assertValidNpmPackageName', () => {
  it('should accept valid twenty-app- prefixed names', () => {
    expect(() => assertValidNpmPackageName('twenty-app-my-cool-app')).not.toThrow();
    expect(() => assertValidNpmPackageName('twenty-app-hello')).not.toThrow();
  });

  it('should accept scoped packages with twenty-app- prefix', () => {
    expect(() =>
      assertValidNpmPackageName('@myorg/twenty-app-my-app'),
    ).not.toThrow();
  });

  it('should reject names without twenty-app- prefix', () => {
    expect(() => assertValidNpmPackageName('my-cool-app')).toThrow(
      ApplicationException,
    );
  });

  it('should reject scoped packages without twenty-app- prefix', () => {
    expect(() =>
      assertValidNpmPackageName('@myorg/my-cool-app'),
    ).toThrow(ApplicationException);
  });

  it('should reject invalid npm package names', () => {
    expect(() => assertValidNpmPackageName('Twenty-App-Test')).toThrow(
      ApplicationException,
    );
    expect(() => assertValidNpmPackageName('twenty-app-../evil')).toThrow(
      ApplicationException,
    );
  });

  it('should reject empty or malformed names', () => {
    expect(() => assertValidNpmPackageName('')).toThrow(ApplicationException);
  });
});
