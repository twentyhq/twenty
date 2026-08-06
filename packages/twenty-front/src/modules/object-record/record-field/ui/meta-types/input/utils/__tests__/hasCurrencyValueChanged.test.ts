import { hasCurrencyValueChanged } from '@/object-record/record-field/ui/meta-types/input/utils/hasCurrencyValueChanged';
import { CurrencyCode } from 'twenty-shared/constants';

describe('hasCurrencyValueChanged', () => {
  it('should not report a change when reopening a field leaves the value untouched', () => {
    expect(
      hasCurrencyValueChanged({
        newValue: { amountMicros: 458640000, currencyCode: CurrencyCode.USD },
        currentValue: {
          amountMicros: 458640000,
          currencyCode: CurrencyCode.USD,
        },
      }),
    ).toBe(false);
  });

  it('should report a change when the amount differs', () => {
    expect(
      hasCurrencyValueChanged({
        newValue: { amountMicros: 45864000000, currencyCode: CurrencyCode.USD },
        currentValue: {
          amountMicros: 458640000,
          currencyCode: CurrencyCode.USD,
        },
      }),
    ).toBe(true);
  });

  it('should report a change when only the currency differs', () => {
    expect(
      hasCurrencyValueChanged({
        newValue: { amountMicros: 458640000, currencyCode: CurrencyCode.EUR },
        currentValue: {
          amountMicros: 458640000,
          currencyCode: CurrencyCode.USD,
        },
      }),
    ).toBe(true);
  });

  it('should not report a change when both amounts are empty', () => {
    expect(
      hasCurrencyValueChanged({
        newValue: { amountMicros: null, currencyCode: CurrencyCode.USD },
        currentValue: { amountMicros: null, currencyCode: CurrencyCode.USD },
      }),
    ).toBe(false);
  });

  it('should report a change when the amount is cleared', () => {
    expect(
      hasCurrencyValueChanged({
        newValue: { amountMicros: null, currencyCode: CurrencyCode.USD },
        currentValue: {
          amountMicros: 458640000,
          currencyCode: CurrencyCode.USD,
        },
      }),
    ).toBe(true);
  });

  it('should ignore extra keys carried by the record store value', () => {
    expect(
      hasCurrencyValueChanged({
        newValue: { amountMicros: 458640000, currencyCode: CurrencyCode.USD },
        currentValue: {
          __typename: 'Currency',
          amountMicros: 458640000,
          currencyCode: CurrencyCode.USD,
        },
      }),
    ).toBe(false);
  });

  it('should report a change when the new value could not be built', () => {
    expect(
      hasCurrencyValueChanged({
        newValue: undefined,
        currentValue: {
          amountMicros: 458640000,
          currencyCode: CurrencyCode.USD,
        },
      }),
    ).toBe(true);
  });

  it('should report a change when the field has no value yet', () => {
    expect(
      hasCurrencyValueChanged({
        newValue: { amountMicros: 458640000, currencyCode: CurrencyCode.USD },
        currentValue: null,
      }),
    ).toBe(true);
  });
});
