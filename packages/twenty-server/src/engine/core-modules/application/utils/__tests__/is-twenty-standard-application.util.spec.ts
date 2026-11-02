import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { isTwentyStandardApplication } from 'src/engine/core-modules/application/utils/is-twenty-standard-application.util';

describe('isTwentyStandardApplication', () => {
  it('should recognize the standard application', () => {
    expect(
      isTwentyStandardApplication({
        universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      }),
    ).toBe(true);
  });

  it('should not recognize another application', () => {
    expect(
      isTwentyStandardApplication({
        universalIdentifier: 'b1a4c0d2-6e1f-4a6b-9c1d-0f2e3a4b5c6d',
      }),
    ).toBe(false);
  });
});
