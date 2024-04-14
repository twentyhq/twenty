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
      currencyCode: `'${currencyDefaultValue.currencyCode}'` as any,
    } satisfies FieldCurrencyValue;
  } else if (typeof defaultValue === 'string') {
    return `'${defaultValue}'`;
  }

  return defaultValue;
};
