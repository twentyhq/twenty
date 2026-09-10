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

  it('should report a change when the amount or currency differs', () => {
    expect(
      hasCurrencyValueChanged({
        newValue: { amountMicros: 45864000000, currencyCode: CurrencyCode.EUR },
        currentValue: {
          amountMicros: 458640000,
          currencyCode: CurrencyCode.USD,
        },
      }),
    ).toBe(true);
  });

  it('should report a change when either side is not a currency value', () => {
    expect(
      hasCurrencyValueChanged({ newValue: undefined, currentValue: null }),
    ).toBe(true);
  });
});
