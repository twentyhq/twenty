import { Controller, useFormContext } from 'react-hook-form';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { phonesSchema as phonesFieldDefaultValueSchema } from '@/object-record/record-field/types/guards/isFieldPhonesValue';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { countryCodeToCallingCode } from '@/settings/data-model/fields/preview/utils/getPhonesFieldPreviewValue';
import { useCountries } from '@/ui/input/components/internal/hooks/useCountries';
import { Select } from '@/ui/input/components/Select';
import { CountryCode } from 'libphonenumber-js';
import { IconCircleOff, IconComponentProps, IconMap } from 'twenty-ui';
import { z } from 'zod';
import { applySimpleQuotesToString } from '~/utils/string/applySimpleQuotesToString';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';

type SettingsDataModelFieldPhonesFormProps = {
  disabled?: boolean;
  defaultCountryCode?: string;
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'icon' | 'label' | 'type' | 'defaultValue' | 'settings'
  >;
};

export const settingsDataModelFieldPhonesFormSchema = z.object({
  defaultValue: phonesFieldDefaultValueSchema,
});

export type SettingsDataModelFieldTextFormValues = z.infer<
  typeof settingsDataModelFieldPhonesFormSchema
>;

export type CountryCodeOrEmpty = CountryCode | '';

export const SettingsDataModelFieldPhonesForm = ({
  disabled,
  fieldMetadataItem,
}: SettingsDataModelFieldPhonesFormProps) => {
  const { control } = useFormContext<SettingsDataModelFieldTextFormValues>();

  const countries = [
    { label: 'No country', value: '', Icon: IconCircleOff },
    ...useCountries()
      .sort((a, b) => a.countryName.localeCompare(b.countryName))
      .map((country) => ({
        label: `${country.countryName} (+${country.callingCode})`,
        value: country.countryCode as CountryCodeOrEmpty,
        Icon: (props: IconComponentProps) =>
          country.Flag({ width: props.size, height: props.size }),
      })),
  ];
  const defaultDefaultValue = {
    primaryPhoneNumber: "''",
    primaryPhoneCountryCode: "''",
    primaryPhoneCallingCode: "''",
    additionalPhones: null,
  };
  const fieldMetadataItemDefaultValue = fieldMetadataItem?.defaultValue;

  return (
    <Controller
      name="defaultValue"
      defaultValue={{
        ...defaultDefaultValue,
        ...fieldMetadataItemDefaultValue,
      }}
      control={control}
      render={({ field: { onChange, value } }) => {
        return (
          <SettingsOptionCardContentSelect
            Icon={IconMap}
            title="Default Country Code"
            description="The default country code for new phone numbers."
          >
            <Select<string>
              dropdownWidth={'auto'}
              dropdownId="selectDefaultCountryCode"
              value={stripSimpleQuotesFromString(
                value?.primaryPhoneCountryCode,
              )}
              onChange={(newPhoneCountryCode) =>
                onChange({
                  ...value,
                  primaryPhoneCountryCode:
                    applySimpleQuotesToString(newPhoneCountryCode),
                  primaryPhoneCallingCode: applySimpleQuotesToString(
                    countryCodeToCallingCode(newPhoneCountryCode),
                  ),
                })
              }
              disabled={disabled}
              options={countries}
              selectSizeVariant="small"
              withSearchInput={true}
            />
          </SettingsOptionCardContentSelect>
        );
      }}
    />
  );
};
