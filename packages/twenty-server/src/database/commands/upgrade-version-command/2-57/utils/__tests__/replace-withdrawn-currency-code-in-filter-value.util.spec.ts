import { replaceWithdrawnCurrencyCodeInFilterValue } from 'src/database/commands/upgrade-version-command/2-57/utils/replace-withdrawn-currency-code-in-filter-value.util';

describe('replaceWithdrawnCurrencyCodeInFilterValue', () => {
  it.each([
    ['["ANG"]', '["XCG"]'],
    ['["USD","ANG"]', '["USD","XCG"]'],
    ['["ANG","XCG"]', '["XCG"]'],
  ])('replaces %s with %s', (value, expected) => {
    expect(replaceWithdrawnCurrencyCodeInFilterValue(value)).toEqual({
      value: expected,
      hasChanged: true,
    });
  });

  it('replaces the currency code in values stored as arrays', () => {
    expect(replaceWithdrawnCurrencyCodeInFilterValue(['USD', 'ANG'])).toEqual({
      value: ['USD', 'XCG'],
      hasChanged: true,
    });
  });

  it.each([['["USD"]'], ['[]'], ['ANG'], ['not json'], [null], [['USD']]])(
    'leaves %p unchanged',
    (value) => {
      expect(replaceWithdrawnCurrencyCodeInFilterValue(value)).toEqual({
        value,
        hasChanged: false,
      });
    },
  );
});
