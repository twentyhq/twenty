import { getRecordFormCurrencyFieldDefaultValue } from '@/object-record/record-form/utils/getRecordFormCurrencyFieldDefaultValue';
import { CurrencyCode } from 'twenty-shared/constants';
import { FieldMetadataType } from '~/generated-metadata/graphql';

describe('getRecordFormCurrencyFieldDefaultValue', () => {
  it('returns the normalized default for a currency field', () => {
    expect(
      getRecordFormCurrencyFieldDefaultValue({
        type: FieldMetadataType.CURRENCY,
        defaultValue: { amountMicros: null, currencyCode: "'USD'" },
      }),
    ).toEqual({ amountMicros: null, currencyCode: CurrencyCode.USD });
  });

  it('keeps a default amount when one is set', () => {
    expect(
      getRecordFormCurrencyFieldDefaultValue({
        type: FieldMetadataType.CURRENCY,
        defaultValue: { amountMicros: 5000000, currencyCode: "'EUR'" },
      }),
    ).toEqual({ amountMicros: 5000000, currencyCode: CurrencyCode.EUR });
  });

  it('returns undefined when the field has no default value', () => {
    expect(
      getRecordFormCurrencyFieldDefaultValue({
        type: FieldMetadataType.CURRENCY,
        defaultValue: undefined,
      }),
    ).toBeUndefined();
  });

  it('returns undefined when the default value is not a valid currency default', () => {
    expect(
      getRecordFormCurrencyFieldDefaultValue({
        type: FieldMetadataType.CURRENCY,
        defaultValue: { amountMicros: null, currencyCode: "'NOT_A_CODE'" },
      }),
    ).toBeUndefined();
  });

  it('returns undefined for non-currency fields', () => {
    expect(
      getRecordFormCurrencyFieldDefaultValue({
        type: FieldMetadataType.TEXT,
        defaultValue: { amountMicros: null, currencyCode: "'USD'" },
      }),
    ).toBeUndefined();
  });
});
