import {
  findNonLowercaseUniversalIdentifiers,
  type Manifest,
} from 'twenty-shared/application';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

export const assertManifestUniversalIdentifiersAreLowercase = (
  manifest: Manifest,
): void => {
  const nonLowercaseUniversalIdentifiers =
    findNonLowercaseUniversalIdentifiers(manifest);

  if (nonLowercaseUniversalIdentifiers.length > 0) {
    throw new ApplicationException(
      `Universal identifiers must be lowercase: ${nonLowercaseUniversalIdentifiers.join(', ')}`,
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }
};
