import { Controller, useFormContext } from 'react-hook-form';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { phonesSchema as phonesFieldDefaultValueSchema } from '@/object-record/record-field/types/guards/isFieldPhonesValue';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { useCountries } from '@/ui/input/components/internal/hooks/useCountries';
import { Select } from '@/ui/input/components/Select';
import { IconMap } from 'twenty-ui';
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

export const SettingsDataModelFieldPhonesForm = ({
  disabled,
  fieldMetadataItem,
}: SettingsDataModelFieldPhonesFormProps) => {
  const { control } = useFormContext<SettingsDataModelFieldTextFormValues>();

  const countries = useCountries()
    .sort((a, b) => a.countryName.localeCompare(b.countryName))
    .map((country) => ({
      label: `${country.countryName} (+${country.callingCode})`,
      value: `+${country.callingCode}`,
    }));
  countries.unshift({ label: 'No country', value: '' });
  const defaultDefaultValue = {
    primaryPhoneNumber: "''",
    primaryPhoneCountryCode: "''",
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
                })
              }
              disabled={disabled}
              options={countries}
              selectSizeVariant="small"
            />
          </SettingsOptionCardContentSelect>
        );
      }}
    />
  );
};
