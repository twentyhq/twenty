/* @license Enterprise */

import { isValidCreditOneTimeTopUpCreditAmount } from 'src/engine/core-modules/billing/utils/is-valid-credit-one-time-top-up-credit-amount.util';

describe('isValidCreditOneTimeTopUpCreditAmount', () => {
  it.each([1, 7, 1_000])('accepts %s credits', (creditAmount) => {
    expect(isValidCreditOneTimeTopUpCreditAmount(creditAmount)).toBe(true);
  });

  it.each([0, -5, 1_001, 2.5, Number.NaN])(
    'refuses %s credits',
    (creditAmount) => {
      expect(isValidCreditOneTimeTopUpCreditAmount(creditAmount)).toBe(false);
    },
  );
});
