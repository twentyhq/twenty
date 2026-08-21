import { IMask } from 'react-imask';

import { NumberFormat } from '@/localization/constants/NumberFormat';
import { getSafeScaleForCurrencyInput } from '@/ui/field/input/utils/getSafeScaleForCurrencyInput';
import { getSeparatorsForNumberFormat } from '~/utils/format/getSeparatorsForNumberFormat';

describe('getSafeScaleForCurrencyInput', () => {
  it('should keep the field decimals when the value has no decimal part', () => {
    expect(getSafeScaleForCurrencyInput({ value: '458', decimals: 2 })).toBe(2);
  });

  it('should keep the field decimals when the value fits in it', () => {
    expect(getSafeScaleForCurrencyInput({ value: '458.6', decimals: 2 })).toBe(
      2,
    );
  });

  it('should widen the scale to the decimals present in the value', () => {
    expect(getSafeScaleForCurrencyInput({ value: '458.64', decimals: 0 })).toBe(
      2,
    );
  });

  it('should handle negative values', () => {
    expect(
      getSafeScaleForCurrencyInput({ value: '-458.64', decimals: 0 }),
    ).toBe(2);
  });

  it('should default to no decimals when neither decimals nor value provide any', () => {
    expect(getSafeScaleForCurrencyInput({ value: '' })).toBe(0);
  });

  it('should ignore a value that is not a plain unmasked number', () => {
    expect(
      getSafeScaleForCurrencyInput({ value: '1.234,56', decimals: 1 }),
    ).toBe(1);
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
