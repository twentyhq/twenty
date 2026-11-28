import { TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/application';

import { isTwentyPublicAppUniversalIdentifier } from 'src/engine/core-modules/application/application-marketplace/utils/is-twenty-public-app-universal-identifier.util';

describe('isTwentyPublicAppUniversalIdentifier', () => {
  it('recognizes a Twenty app identifier, whatever its case', () => {
    expect(
      isTwentyPublicAppUniversalIdentifier(
        TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.GITHUB.toUpperCase(),
      ),
    ).toBe(true);
  });

  it('rejects any other identifier', () => {
    expect(
      isTwentyPublicAppUniversalIdentifier(
        '0b7a3f1e-2c4d-4e5f-8a9b-1c2d3e4f5a6b',
      ),
    ).toBe(false);
  });
});
