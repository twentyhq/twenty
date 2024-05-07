import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import { FieldCurrencyValue } from '@/object-record/record-field/types/FieldMetadata';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const getDefaultValueForBackend = (
  defaultValue: any,
  fieldMetadataType: FieldMetadataType,
) => {
  if (fieldMetadataType === FieldMetadataType.Currency) {
    const currencyDefaultValue = defaultValue as FieldCurrencyValue;
    return {
      amountMicros: currencyDefaultValue.amountMicros,
      currencyCode: `'${currencyDefaultValue.currencyCode}'` as CurrencyCode,
    } satisfies FieldCurrencyValue;
  } else if (fieldMetadataType === FieldMetadataType.Select) {
    return `'${defaultValue}'`;
  } else if (fieldMetadataType === FieldMetadataType.MultiSelect) {
    return defaultValue.map((value: string) => `'${value}'`);
  }

  return defaultValue;
};
