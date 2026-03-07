import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

// NPM package names: optional @scope/ prefix, then name segment
// Rejects path traversal (..), control characters, and non-npm-valid names
const NPM_PACKAGE_NAME_REGEX =
  /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

const TWENTY_APP_PREFIX = 'twenty-app-';
const TWENTY_APP_SCOPED_PREFIX = /^@[^/]+\/twenty-app-/;

export const assertValidNpmPackageName = (name: string): void => {
  if (!NPM_PACKAGE_NAME_REGEX.test(name) || name.includes('..')) {
    throw new ApplicationException(
      'Invalid npm package name',
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }

  if (
    !name.startsWith(TWENTY_APP_PREFIX) &&
    !TWENTY_APP_SCOPED_PREFIX.test(name)
  ) {
    throw new ApplicationException(
      'npm package name must start with "twenty-app-" (or "@scope/twenty-app-")',
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }
};
