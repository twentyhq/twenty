import { Controller, useFormContext } from 'react-hook-form';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { addressSchema as addressFieldDefaultValueSchema } from '@/object-record/record-field/types/guards/isFieldAddressValue';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { useCountries } from '@/ui/input/components/internal/hooks/useCountries';
import { Select, SelectOption } from '@/ui/input/components/Select';
import { IconCircleOff, IconComponentProps, IconMap } from 'twenty-ui';
import { z } from 'zod';
import { applySimpleQuotesToString } from '~/utils/string/applySimpleQuotesToString';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';
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
  const countries = [
    {
      label: 'No country',
      value: '',
      Icon: IconCircleOff,
    },
    ...useCountries()
      .sort((a, b) => a.countryName.localeCompare(b.countryName))
      .map<SelectOption<string>>(({ countryName, Flag }) => ({
        label: countryName,
        value: countryName,
        Icon: (props: IconComponentProps) =>
          Flag({ width: props.size, height: props.size }),
      })),
  ];

  const defaultDefaultValue = {
    addressStreet1: "''",
    addressStreet2: null,
    addressCity: null,
    addressState: null,
    addressPostcode: null,
    addressCountry: null,
    addressLat: null,
    addressLng: null,
  };

  return (
    <Controller
      name="defaultValue"
      defaultValue={{
        ...defaultDefaultValue,
        ...fieldMetadataItem?.defaultValue,
      }}
      control={control}
      render={({ field: { onChange, value } }) => {
        const defaultCountry = value?.addressCountry || '';
        return (
          <SettingsOptionCardContentSelect
            Icon={IconMap}
            title="Default Country"
            description="The default country for new addresses"
          >
            <Select<string>
              dropdownWidth={220}
              disabled={disabled}
              dropdownId="selectDefaultCountry"
              value={stripSimpleQuotesFromString(defaultCountry)}
              onChange={(newCountry) =>
                onChange({
                  ...value,
                  addressCountry: applySimpleQuotesToString(newCountry),
                })
              }
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
