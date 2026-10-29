import { replaceWithdrawnCurrencyCodeInFilterValue } from 'src/database/commands/upgrade-version-command/2-53/utils/replace-withdrawn-currency-code-in-filter-value.util';

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

  it.each([['["USD"]'], ['[]'], ['ANG'], ['not json'], [null], [['ANG']]])(
    'leaves %p unchanged',
    (value) => {
      expect(replaceWithdrawnCurrencyCodeInFilterValue(value)).toEqual({
        value,
        hasChanged: false,
      });
    },
  );
});
