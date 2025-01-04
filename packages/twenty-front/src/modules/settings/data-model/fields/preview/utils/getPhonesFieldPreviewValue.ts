import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { DEFAULT_PHONE_CALLING_CODE } from '@/object-record/record-field/meta-types/input/components/PhonesFieldInput';
import { FieldPhonesValue } from '@/object-record/record-field/types/FieldMetadata';
import { getSettingsFieldTypeConfig } from '@/settings/data-model/utils/getSettingsFieldTypeConfig';
import {
  CountryCode,
  getCountries,
  getCountryCallingCode,
} from 'libphonenumber-js';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';

const isStrCountryCodeGuard = (str: string): str is CountryCode => {
  return getCountries().includes(str as CountryCode);
};

export const countryCodeToCallingCode = (countryCode: string): string => {
  if (!countryCode || !isStrCountryCodeGuard(countryCode)) {
    return `+${DEFAULT_PHONE_CALLING_CODE}`;
  }

  const callingCode = getCountryCallingCode(countryCode);

  return callingCode ? `+${callingCode}` : `+${DEFAULT_PHONE_CALLING_CODE}`;
};

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
