import { Separator } from '@/settings/components/Separator';
import { Controller, useFormContext } from 'react-hook-form';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  addressSchema as addressFieldDefaultValueSchema,
  addressSettingsSchema,
} from '@/object-record/record-field/types/guards/isFieldAddressValue';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { MultiSelectAddressFields } from '@/settings/data-model/fields/forms/address/components/MultiSelectAddressFields';
import { DEFAULT_SELECTION_ADDRESS_WITH_MESSAGES } from '@/settings/data-model/fields/forms/address/constants/DefaultSelectionAddressWithMessages';
import { useAddressSettingsFormInitialValues } from '@/settings/data-model/fields/forms/address/hooks/useAddressSettingsFormInitialValues';
import { useCountries } from '@/ui/input/components/internal/hooks/useCountries';
import { Select } from '@/ui/input/components/Select';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useLingui } from '@lingui/react/macro';
import { MouseEvent } from 'react';
import {
  IconCircleOff,
  IconComponentProps,
  IconList,
  IconMap,
  IconRefresh,
} from 'twenty-ui/display';
import { SelectOption } from 'twenty-ui/input';
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
  settings: addressSettingsSchema,
});

export type SettingsDataModelFieldTextFormValues = z.infer<
  typeof settingsDataModelFieldAddressFormSchema
>;

export const SettingsDataModelFieldAddressForm = ({
  disabled,
  fieldMetadataItem,
}: SettingsDataModelFieldAddressFormProps) => {
  const { t } = useLingui();
  const { control } = useFormContext<SettingsDataModelFieldTextFormValues>();
  const countries = [
    {
      label: 'No country',
      value: '',
      Icon: IconCircleOff,
    },
    ...useCountries()
      .sort((a, b) => a.countryName.localeCompare(b.countryName))
      .map<SelectOption>(({ countryName, Flag }) => ({
        label: countryName,
        value: countryName,
        Icon: (props: IconComponentProps) =>
          Flag({ width: props.size, height: props.size }),
      })),
  ];
  const { initialDisplaySubFields, resetDefaultValueField } =
    useAddressSettingsFormInitialValues({ fieldMetadataItem });

  const { closeDropdown } = useCloseDropdown();
  const reset = () => {
    resetDefaultValueField();
    closeDropdown('addressSubFieldsId');
  };
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
    <>
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
              title={t`Default Country`}
              description={t`The default country for new addresses`}
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
      <Separator />
      <Controller
        name="settings.subFields"
        defaultValue={initialDisplaySubFields}
        control={control}
        render={({ field: { onChange, value } }) => {
          const values = value ?? [];
          return (
            <SettingsOptionCardContentSelect
              Icon={IconList}
              title={t`Sub-Fields`}
              description={t`Decide which Sub-address fields you want to display`}
            >
              <MultiSelectAddressFields<string>
                options={DEFAULT_SELECTION_ADDRESS_WITH_MESSAGES.map(
                  (option) => ({
                    ...option,
                    label: t(option.label),
                  }),
                )}
                values={values}
                dropdownId={'addressSubFieldsId'}
                onChange={onChange}
                callToActionButton={{
                  text: t`Reset to default`,
                  onClick: (event: MouseEvent<HTMLDivElement>) => {
                    event.preventDefault();
                    reset();
                  },
                  Icon: IconRefresh,
                }}
                selectSizeVariant="small"
              />
            </SettingsOptionCardContentSelect>
          );
        }}
      />
    </>
  );
};
