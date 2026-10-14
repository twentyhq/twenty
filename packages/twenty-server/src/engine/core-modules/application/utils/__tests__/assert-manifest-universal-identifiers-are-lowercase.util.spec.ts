import { type Manifest } from 'twenty-shared/application';

import { ApplicationExceptionCode } from 'src/engine/core-modules/application/application.exception';
import { assertManifestUniversalIdentifiersAreLowercase } from 'src/engine/core-modules/application/utils/assert-manifest-universal-identifiers-are-lowercase.util';

const UNIVERSAL_IDENTIFIER = 'd1ee2c0c-a30b-4ebf-b007-377fd1d22cc3';

const buildManifest = (fieldUniversalIdentifier: string) =>
  ({
    application: { universalIdentifier: UNIVERSAL_IDENTIFIER },
    fields: [{ universalIdentifier: fieldUniversalIdentifier }],
  }) as unknown as Manifest;

describe('assertManifestUniversalIdentifiersAreLowercase', () => {
  it('should accept a lowercase manifest', () => {
    expect(() =>
      assertManifestUniversalIdentifiersAreLowercase(
        buildManifest(UNIVERSAL_IDENTIFIER),
      ),
    ).not.toThrow();
  });

  it('should reject a manifest with an uppercase identifier', () => {
    const uppercaseUniversalIdentifier = UNIVERSAL_IDENTIFIER.toUpperCase();

    expect(() =>
      assertManifestUniversalIdentifiersAreLowercase(
        buildManifest(uppercaseUniversalIdentifier),
      ),
    ).toThrow(
      expect.objectContaining({
        code: ApplicationExceptionCode.INVALID_INPUT,
        message: `Universal identifiers must be lowercase: ${uppercaseUniversalIdentifier}`,
      }),
    );
  });
});
