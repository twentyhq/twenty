import { isSameUniversalIdentifier } from 'src/engine/core-modules/application/application-package/utils/is-same-universal-identifier.util';

const UNIVERSAL_IDENTIFIER = '4f1c2a3b-5d6e-4f70-8a9b-0c1d2e3f4a5b';

describe('isSameUniversalIdentifier', () => {
  it.each([
    UNIVERSAL_IDENTIFIER,
    UNIVERSAL_IDENTIFIER.toUpperCase(),
    '4F1c2A3b-5D6e-4f70-8A9b-0C1d2E3f4A5b',
  ])('should match %s regardless of casing', (value) => {
    expect(
      isSameUniversalIdentifier({
        value,
        universalIdentifier: UNIVERSAL_IDENTIFIER,
      }),
    ).toBe(true);
  });

  it.each(['9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d', '', undefined, null, 42])(
    'should not match %p',
    (value) => {
      expect(
        isSameUniversalIdentifier({
          value,
          universalIdentifier: UNIVERSAL_IDENTIFIER,
        }),
      ).toBe(false);
    },
  );
});
