/* @license Enterprise */

import { parseMemberCreditsAmount } from 'src/engine/core-modules/billing/utils/parse-member-credits-amount.util';

describe('parseMemberCreditsAmount', () => {
  it('reads a micro-credit amount', () => {
    expect(parseMemberCreditsAmount('3000000')).toBe(3_000_000);
  });

  it.each([
    ['zero', '0'],
    ['a decimal amount', '3.5'],
    ['an amount beyond the safe integer range', '9007199254740993'],
    ['a number instead of a string', 3_000_000],
  ])('reads no amount from %s', (_label, value) => {
    expect(parseMemberCreditsAmount(value)).toBeNull();
  });
});
