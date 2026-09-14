import { IMask } from 'react-imask';

import { NumberFormat } from '@/localization/constants/NumberFormat';
import {
  CURRENCY_INPUT_MAX_SCALE,
  getSafeScaleForCurrencyInput,
} from '@/ui/field/input/utils/getSafeScaleForCurrencyInput';
import { convertCurrencyAmountToCurrencyMicros } from '~/utils/convertCurrencyToCurrencyMicros';
import { getSeparatorsForNumberFormat } from '~/utils/format/getSeparatorsForNumberFormat';

describe('getSafeScaleForCurrencyInput', () => {
  it('should return the maximum micros scale of 6 decimals', () => {
    expect(getSafeScaleForCurrencyInput({ value: '458', decimals: 2 })).toBe(6);
    expect(getSafeScaleForCurrencyInput({ value: '458.6', decimals: 0 })).toBe(
      6,
    );
    expect(getSafeScaleForCurrencyInput({ value: '458.64', decimals: 0 })).toBe(
      6,
    );
    expect(
      getSafeScaleForCurrencyInput({ value: '-458.64', decimals: 0 }),
    ).toBe(6);
    expect(getSafeScaleForCurrencyInput({ value: '' })).toBe(6);
    expect(getSafeScaleForCurrencyInput()).toBe(6);
  });
});

describe('currency mask round trip with the safe scale', () => {
  it.each([
    [NumberFormat.DOTS_AND_COMMA, '458,64'],
    [NumberFormat.COMMAS_AND_DOT, '458.64'],
    [NumberFormat.SPACES_AND_COMMA, '458,64'],
    [NumberFormat.APOSTROPHE_AND_DOT, '458.64'],
  ])(
    'should not alter 458.64 with decimals 0 under the %s format',
    (numberFormat, expectedMaskedValue) => {
      const { thousandsSeparator, radix } =
        getSeparatorsForNumberFormat(numberFormat);

      const mask = IMask.createMask({
        mask: Number,
        thousandsSeparator,
        radix,
        scale: getSafeScaleForCurrencyInput({ value: '458.64', decimals: 0 }),
      });

      mask.unmaskedValue = '458.64';

      expect(mask.value).toBe(expectedMaskedValue);
      expect(mask.unmaskedValue).toBe('458.64');
    },
  );
});

describe('typing into currency field configured with 0 decimals', () => {
  it.each([
    [NumberFormat.COMMAS_AND_DOT, '1234.56', '1234.56', '1,234.56'],
    [NumberFormat.DOTS_AND_COMMA, '1234,56', '1234.56', '1.234,56'],
    [NumberFormat.SPACES_AND_COMMA, '1234,56', '1234.56', '1 234,56'],
    [NumberFormat.APOSTROPHE_AND_DOT, '1234.56', '1234.56', "1'234.56"],
  ])(
    'should not strip radix or multiply when typing 1234.56 under %s format',
    (numberFormat, typedInput, expectedUnmasked, expectedMasked) => {
      const { thousandsSeparator, radix } =
        getSeparatorsForNumberFormat(numberFormat);

      const mask = IMask.createMask({
        mask: Number,
        thousandsSeparator,
        radix,
        scale: CURRENCY_INPUT_MAX_SCALE,
      });

      for (const char of typedInput) {
        mask.append(char);
      }

      expect(mask.unmaskedValue).toBe(expectedUnmasked);
      expect(mask.value).toBe(expectedMasked);

      const parsedAmount = parseFloat(mask.unmaskedValue);
      const amountMicros = convertCurrencyAmountToCurrencyMicros(parsedAmount);

      expect(amountMicros).toBe(1234560000);
      expect(amountMicros).not.toBe(123456000000);
    },
  );
});
