import { describe, expect, it } from 'vitest';

import { withBothManifestReferenceSpellings } from '@/app/manifest/utils/with-both-manifest-reference-spellings';

const CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER =
  '6b1f0a52-4d8e-4c4e-9b0a-2f5d8a7c1e02';

describe('withBothManifestReferenceSpellings', () => {
  it('should add the deprecated form to a reference written as a universal identifier', () => {
    expect(
      withBothManifestReferenceSpellings({
        entity: {
          name: 'linkedin-messaging',
          connectionProviderUniversalIdentifier:
            CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
        },
        referenceKeys: ['connectionProvider', 'sendMessageLogicFunction'],
      }),
    ).toEqual({
      name: 'linkedin-messaging',
      connectionProviderUniversalIdentifier:
        CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
      connectionProvider: {
        universalIdentifier: CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
      },
    });
  });

  it('should add the universal identifier to a reference written in the deprecated form', () => {
    expect(
      withBothManifestReferenceSpellings({
        entity: {
          connectionProvider: {
            universalIdentifier: CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
          },
        },
        referenceKeys: ['connectionProvider'],
      }),
    ).toEqual({
      connectionProviderUniversalIdentifier:
        CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
      connectionProvider: {
        universalIdentifier: CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
      },
    });
  });
});
