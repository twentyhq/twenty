import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldAddressValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getSettingsFieldTypeConfig } from '@/settings/data-model/utils/getSettingsFieldTypeConfig';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';

export const getAddressFieldPreviewValue = ({
  fieldMetadataItem,
}: {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'defaultValue' | 'options' | 'type'
  >;
}): FieldAddressValue | null => {
  if (fieldMetadataItem.type !== FieldMetadataType.ADDRESS) return null;

  const addressFieldTypeConfig = getSettingsFieldTypeConfig(
    FieldMetadataType.ADDRESS,
  );

  const placeholderDefaultValue = addressFieldTypeConfig.exampleValues?.[0];

  const addressCountry =
    fieldMetadataItem.defaultValue?.addressCountry &&
    fieldMetadataItem.defaultValue.addressCountry !== ''
      ? stripSimpleQuotesFromString(
          fieldMetadataItem.defaultValue?.addressCountry,
        )
      : null;
  return {
    ...placeholderDefaultValue,
    addressCountry: addressCountry,
  };
};
