import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldPhonesValue } from '@/object-record/record-field/types/FieldMetadata';
import { getSettingsFieldTypeConfig } from '@/settings/data-model/utils/getSettingsFieldTypeConfig';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';

export const getPhonesFieldPreviewValue = ({
  fieldMetadataItem,
}: {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'defaultValue' | 'options' | 'type'
  >;
}): FieldPhonesValue | null => {
  if (fieldMetadataItem.type !== FieldMetadataType.Phones) return null;

  const phonesFieldTypeConfig = getSettingsFieldTypeConfig(
    FieldMetadataType.Phones,
  );

  const placeholderDefaultValue = phonesFieldTypeConfig.exampleValue;
  const primaryPhoneCountryCode =
    fieldMetadataItem.defaultValue?.primaryPhoneCountryCode &&
    fieldMetadataItem.defaultValue.primaryPhoneCountryCode !== ''
      ? stripSimpleQuotesFromString(
          fieldMetadataItem.defaultValue?.primaryPhoneCountryCode,
        )
      : null;
  return {
    ...placeholderDefaultValue,
    primaryPhoneCountryCode,
  };
};
