import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldPhonesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getSettingsFieldTypeConfig } from '@/settings/data-model/utils/getSettingsFieldTypeConfig';
import {
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from 'libphonenumber-js';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';

const isStrCountryCodeGuard = (str: string): str is CountryCode => {
  return getCountries().includes(str as CountryCode);
};

export const countryCodeToCallingCode = (countryCode: string): string => {
  if (!countryCode || !isStrCountryCodeGuard(countryCode)) {
    return '';
  }

  const callingCode = getCountryCallingCode(countryCode);

  return callingCode ? `+${callingCode}` : '';
};

export const getPhonesFieldPreviewValue = ({
  fieldMetadataItem,
}: {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'defaultValue' | 'options' | 'type'
  >;
}): FieldPhonesValue | null => {
  if (fieldMetadataItem.type !== FieldMetadataType.PHONES) return null;

  const phonesFieldTypeConfig = getSettingsFieldTypeConfig(
    FieldMetadataType.PHONES,
  );

  const placeholderDefaultValue = phonesFieldTypeConfig.exampleValues?.[0];
  const primaryPhoneCountryCode =
    fieldMetadataItem.defaultValue?.primaryPhoneCountryCode &&
    fieldMetadataItem.defaultValue.primaryPhoneCountryCode !== ''
      ? stripSimpleQuotesFromString(
          fieldMetadataItem.defaultValue?.primaryPhoneCountryCode,
        )
      : null;
  const primaryPhoneCallingCode =
    fieldMetadataItem.defaultValue?.primaryPhoneCallingCode &&
    fieldMetadataItem.defaultValue.primaryPhoneCallingCode !== ''
      ? stripSimpleQuotesFromString(
          fieldMetadataItem.defaultValue?.primaryPhoneCallingCode,
        )
      : null;
  return {
    ...placeholderDefaultValue,
    primaryPhoneCountryCode,
    primaryPhoneCallingCode,
  };
};
