import { Controller, useFormContext } from 'react-hook-form';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { useCountries } from '@/ui/input/components/internal/hooks/useCountries';
import styled from '@emotion/styled';
import { IconMap } from 'twenty-ui';
import { z } from 'zod';

const StyledFormCardTitle = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

type SettingsDataModelFieldAddressFormProps = {
  disabled?: boolean;
  defaultCountry?: string;
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'icon' | 'label' | 'type' | 'defaultValue' | 'settings'
  >;
};

export const addressFieldDefaultValueSchema = z.object({
  defaultCountry: z.string().nullable(),
});

export const settingsDataModelFieldAddressFormSchema = z.object({
  settings: addressFieldDefaultValueSchema,
});

export type SettingsDataModelFieldTextFormValues = z.infer<
  typeof settingsDataModelFieldAddressFormSchema
>;

export const SettingsDataModelFieldAddressForm = ({
  disabled,
  fieldMetadataItem,
}: SettingsDataModelFieldAddressFormProps) => {
  const { control } = useFormContext<SettingsDataModelFieldTextFormValues>();
  const countries = useCountries().map(country => ({
    label: country.countryName,
    value: country.countryName
  }))
  return (
      <Controller
        name="settings"
        defaultValue={{
          defaultCountry: fieldMetadataItem?.settings?.defaultCountry || 'United States',
        }}
        control={control}
        render={({ field: { onChange, value } }) => {
          const defaultCountry = value?.defaultCountry ?? 0;

          return (
            <>
              <SettingsOptionCardContentSelect
              Icon={IconMap}
              dropdownId="selectDefaultCountry"
              title="Default Country"
              description="The default country for new addresses"
              value={defaultCountry}
              onChange={(value) => onChange({ defaultCountry: value })}
              disabled={disabled}
              options={countries}
            />
            </>
          );
        }}
      />
  );
};
