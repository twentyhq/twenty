import { IMask } from 'react-imask';

import { NumberFormat } from '@/localization/constants/NumberFormat';
import {
  CURRENCY_INPUT_MAX_SCALE,
  getSafeScaleForCurrencyInput,
} from '@/ui/field/input/utils/getSafeScaleForCurrencyInput';
import { getSeparatorsForNumberFormat } from '~/utils/format/getSeparatorsForNumberFormat';

describe('getSafeScaleForCurrencyInput', () => {
  it('should guarantee a minimum scale of CURRENCY_INPUT_MAX_SCALE to support stored precision without dropping decimals', () => {
    expect(getSafeScaleForCurrencyInput({ value: '458', decimals: 0 })).toBe(
      CURRENCY_INPUT_MAX_SCALE,
    );
    expect(getSafeScaleForCurrencyInput({ value: '458', decimals: 2 })).toBe(
      CURRENCY_INPUT_MAX_SCALE,
    );
    expect(getSafeScaleForCurrencyInput({ value: '' })).toBe(
      CURRENCY_INPUT_MAX_SCALE,
    );
  });

  it('should keep the scale at CURRENCY_INPUT_MAX_SCALE when the value fits in it', () => {
    expect(getSafeScaleForCurrencyInput({ value: '458.6', decimals: 2 })).toBe(
      CURRENCY_INPUT_MAX_SCALE,
    );
  });

  it('should widen the scale when the value has more decimals than CURRENCY_INPUT_MAX_SCALE', () => {
    expect(
      getSafeScaleForCurrencyInput({ value: '458.1234567', decimals: 0 }),
    ).toBe(7);
  });

  it('should widen the scale when field decimals exceeds CURRENCY_INPUT_MAX_SCALE', () => {
    expect(getSafeScaleForCurrencyInput({ value: '458', decimals: 8 })).toBe(8);
  });

  it('should handle negative values with high precision', () => {
    expect(
      getSafeScaleForCurrencyInput({ value: '-458.12345678', decimals: 0 }),
    ).toBe(8);
  });

  it('should fallback to CURRENCY_INPUT_MAX_SCALE when value is not a plain unmasked number', () => {
    expect(
      getSafeScaleForCurrencyInput({ value: '1.234,56', decimals: 1 }),
    ).toBe(CURRENCY_INPUT_MAX_SCALE);
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

describe('currency mask typing with 0-decimal default field (#25870)', () => {
  it('should accept typing decimals into a 0-decimal currency field without dropping the separator or multiplying the amount', () => {
    const { thousandsSeparator, radix } = getSeparatorsForNumberFormat(
      NumberFormat.COMMAS_AND_DOT,
    );

    const mask = IMask.createMask({
      mask: Number,
      thousandsSeparator,
      radix,
      scale: getSafeScaleForCurrencyInput({ value: '', decimals: 0 }),
    });

    for (const char of '1234.5678') {
      mask.append(char, { input: true });
    }

    expect(mask.value).toBe('1,234.5678');
    expect(mask.unmaskedValue).toBe('1234.5678');
    expect(mask.unmaskedValue).not.toBe('12345678');
  });

  it('should accept comma radix under DOTS_AND_COMMA format without multiplying amount', () => {
    const { thousandsSeparator, radix } = getSeparatorsForNumberFormat(
      NumberFormat.DOTS_AND_COMMA,
    );

    const mask = IMask.createMask({
      mask: Number,
      thousandsSeparator,
      radix,
      scale: getSafeScaleForCurrencyInput({ value: '', decimals: 0 }),
    });

    for (const char of '1234,56') {
      mask.append(char, { input: true });
    }

    expect(mask.value).toBe('1.234,56');
    expect(mask.unmaskedValue).toBe('1234.56');
  });
});
