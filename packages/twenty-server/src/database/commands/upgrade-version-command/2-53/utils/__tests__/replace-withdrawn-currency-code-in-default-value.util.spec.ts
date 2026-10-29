import { replaceWithdrawnCurrencyCodeInDefaultValue } from 'src/database/commands/upgrade-version-command/2-53/utils/replace-withdrawn-currency-code-in-default-value.util';

describe('replaceWithdrawnCurrencyCodeInDefaultValue', () => {
  it('replaces a quoted withdrawn currency code', () => {
    expect(
      replaceWithdrawnCurrencyCodeInDefaultValue({
        amountMicros: null,
        currencyCode: "'ANG'",
      }),
    ).toEqual({
      value: { amountMicros: null, currencyCode: "'XCG'" },
      hasChanged: true,
    });
  });

  it.each([
    [null],
    [{ amountMicros: null, currencyCode: "'USD'" }],
    [{ amountMicros: null, currencyCode: null }],
    ["'ANG'"],
  ])('leaves %p unchanged', (defaultValue) => {
    expect(replaceWithdrawnCurrencyCodeInDefaultValue(defaultValue)).toEqual({
      value: defaultValue,
      hasChanged: false,
    });
  });
});
