import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldCurrencyValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { currencyFieldDefaultValueSchema } from '@/object-record/record-field/ui/validation-schemas/currencyFieldDefaultValueSchema';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';
import { type CurrencyCode } from 'twenty-shared/constants';

export const getRecordFormCurrencyFieldDefaultValue = (
  fieldMetadataItem: Pick<FieldMetadataItem, 'type' | 'defaultValue'>,
): FieldCurrencyValue | undefined => {
  if (fieldMetadataItem.type !== FieldMetadataType.CURRENCY) {
    return undefined;
  }

  if (!isDefined(fieldMetadataItem.defaultValue)) {
    return undefined;
  }

  const parsedDefaultValue = currencyFieldDefaultValueSchema.safeParse(
    fieldMetadataItem.defaultValue,
  );

  if (!parsedDefaultValue.success) {
    return undefined;
  }

  return {
    amountMicros: parsedDefaultValue.data.amountMicros,
    currencyCode: stripSimpleQuotesFromString(
      parsedDefaultValue.data.currencyCode,
    ) as CurrencyCode,
  };
};
