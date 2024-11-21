import { Controller, useFormContext } from 'react-hook-form';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { addressSchema as addressFieldDefaultValueSchema } from '@/object-record/record-field/types/guards/isFieldAddressValue';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { useCountries } from '@/ui/input/components/internal/hooks/useCountries';
import { IconMap } from 'twenty-ui';
import { z } from 'zod';
import { removeSingleQuotesFromStrings } from '~/pages/settings/data-model/utils/compute-metadata-defaultValue-utils';

type SettingsDataModelFieldAddressFormProps = {
  disabled?: boolean;
  defaultCountry?: string;
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'icon' | 'label' | 'type' | 'defaultValue' | 'settings'
  >;
};

export const settingsDataModelFieldAddressFormSchema = z.object({
  defaultValue: addressFieldDefaultValueSchema,
});

export type SettingsDataModelFieldTextFormValues = z.infer<
  typeof settingsDataModelFieldAddressFormSchema
>;

export const SettingsDataModelFieldAddressForm = ({
  disabled,
  fieldMetadataItem,
}: SettingsDataModelFieldAddressFormProps) => {
  const { control } = useFormContext<SettingsDataModelFieldTextFormValues>();
  const countries = useCountries().map((country) => ({
    label: country.countryName,
    value: country.countryName,
  }));
  countries.unshift({ label: 'No country', value: '' });
  const defaultValueInstance = {
    addressStreet1: '',
    addressStreet2: null,
    addressCity: null,
    addressState: null,
    addressPostcode: null,
    addressCountry: null,
    addressLat: null,
    addressLng: null,
  };
  const fieldMetadataItemDefaultValue = fieldMetadataItem?.defaultValue
    ? removeSingleQuotesFromStrings(fieldMetadataItem?.defaultValue)
    : fieldMetadataItem?.defaultValue;

  return (
    <Controller
      name="defaultValue"
      defaultValue={{
        ...defaultValueInstance,
        ...fieldMetadataItemDefaultValue,
      }}
      control={control}
      render={({ field: { onChange, value } }) => {
        const defaultCountry = value?.addressCountry || '';
        return (
          <>
            <SettingsOptionCardContentSelect
              Icon={IconMap}
              dropdownId="selectDefaultCountry"
              title="Default Country"
              description="The default country for new addresses"
              value={defaultCountry}
              onChange={(newCountry) =>
                onChange({ ...value, addressCountry: newCountry })
              }
              disabled={disabled}
              options={countries}
            />
          </>
        );
      }}
    />
  );
};
