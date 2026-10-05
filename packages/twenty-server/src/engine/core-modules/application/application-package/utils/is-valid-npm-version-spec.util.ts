import semver from 'semver';
import { isDefined } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

const MAX_VERSION_SPEC_LENGTH = 256;

// npm dist-tags are single URL path segments: no slash, percent sign, or
// whitespace, so the spec can never escape the package segment of the
// registry URL.
const NPM_DIST_TAG_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

export const isValidNpmVersionSpec = (versionSpec: string): boolean => {
  if (
    versionSpec.length === 0 ||
    versionSpec.length > MAX_VERSION_SPEC_LENGTH ||
    versionSpec.includes('..')
  ) {
    return false;
  }

  // Accept an exact version, build metadata included, by rebuilding the
  // canonical form from the parse; comparing to semver.valid drops build
  // metadata, and comparing to the raw input would keep a leading v or
  // surrounding whitespace.
  const parsed = semver.parse(versionSpec);

  if (isDefined(parsed)) {
    const canonicalVersion =
      parsed.build.length > 0
        ? `${parsed.version}+${parsed.build.join('.')}`
        : parsed.version;

    if (canonicalVersion === versionSpec) {
      return true;
    }
  }

  // npm refuses dist-tags that parse as a semver range, so anything the
  // registry would resolve as a range is neither an exact version nor a tag.
  return (
    NPM_DIST_TAG_REGEX.test(versionSpec) &&
    !isDefined(semver.validRange(versionSpec))
  );
};

export const assertValidNpmVersionSpec = (versionSpec: string): void => {
  if (!isValidNpmVersionSpec(versionSpec)) {
    throw new ApplicationException(
      'Invalid npm version: expected an exact semver version or a dist-tag',
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }
};
