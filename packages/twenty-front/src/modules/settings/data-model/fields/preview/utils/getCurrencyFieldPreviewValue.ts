import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import { FieldCurrencyValue } from '@/object-record/record-field/types/FieldMetadata';
import { currencyFieldDefaultValueSchema } from '@/object-record/record-field/validation-schemas/currencyFieldDefaultValueSchema';
import { getSettingsFieldTypeConfig } from '@/settings/data-model/utils/getSettingsFieldTypeConfig';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';

export const getCurrencyFieldPreviewValue = ({
  fieldMetadataItem,
}: {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'defaultValue' | 'options' | 'type' | 'settings'
  >;
}): FieldCurrencyValue | null => {
  if (fieldMetadataItem.type !== FieldMetadataType.CURRENCY) return null;

  const currencyFieldTypeConfig = getSettingsFieldTypeConfig(
    FieldMetadataType.CURRENCY,
  );

  const placeholderDefaultValue = currencyFieldTypeConfig.exampleValues?.[0];

  return currencyFieldDefaultValueSchema
    .transform((value) => ({
      amountMicros: value.amountMicros || placeholderDefaultValue.amountMicros,
      currencyCode: stripSimpleQuotesFromString(
        value.currencyCode,
      ) as CurrencyCode,
    }))
    .catch(placeholderDefaultValue)
    .parse(fieldMetadataItem.defaultValue);
};
