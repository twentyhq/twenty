import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldCurrencyFormat } from '@/object-record/record-field/types/FieldMetadata';
import { currencyFieldDefaultValueSchema } from '@/object-record/record-field/validation-schemas/currencyFieldDefaultValueSchema';
import { currencyFieldSettingsSchema } from '@/object-record/record-field/validation-schemas/currencyFieldSettingsSchema';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { CURRENCIES } from '@/settings/data-model/constants/Currencies';
import { useCurrencySettingsFormInitialValues } from '@/settings/data-model/fields/forms/currency/hooks/useCurrencySettingsFormInitialValues';
import { Select } from '@/ui/input/components/Select';
import { useLingui } from '@lingui/react/macro';
import { IconCheckbox, IconCurrencyDollar } from 'twenty-ui/display';
import { applySimpleQuotesToString } from '~/utils/string/applySimpleQuotesToString';

export const settingsDataModelFieldCurrencyFormSchema = z.object({
  defaultValue: currencyFieldDefaultValueSchema,
  settings: currencyFieldSettingsSchema,
});

export type SettingsDataModelFieldCurrencyFormValues = z.infer<
  typeof settingsDataModelFieldCurrencyFormSchema
>;

type SettingsDataModelFieldCurrencyFormProps = {
  disabled?: boolean;
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'icon' | 'label' | 'type' | 'defaultValue' | 'settings'
  >;
};

export const SettingsDataModelFieldCurrencyForm = ({
  disabled,
  fieldMetadataItem,
}: SettingsDataModelFieldCurrencyFormProps) => {
  const { t } = useLingui();
  const {
    initialAmountMicrosValue,
    initialCurrencyCodeValue,
    initialSettingsValue,
  } = useCurrencySettingsFormInitialValues({
    fieldMetadataItem,
  });
  const { control } =
    useFormContext<SettingsDataModelFieldCurrencyFormValues>();

  return (
    <>
      <Controller
        name="defaultValue.amountMicros"
        control={control}
        defaultValue={initialAmountMicrosValue}
        render={() => <></>}
      />
      <Controller
        name="defaultValue.currencyCode"
        control={control}
        defaultValue={initialCurrencyCodeValue}
        render={({ field: { onChange, value } }) => (
          <SettingsOptionCardContentSelect
            Icon={IconCurrencyDollar}
            title={t`Default Value`}
            description={t`Choose the default currency that will apply`}
          >
            <Select<string>
              dropdownWidth={220}
              value={value}
              onChange={onChange}
              disabled={disabled}
              dropdownId="object-field-default-value-select-currency"
              options={CURRENCIES.map(({ value, ...rest }) => ({
                ...rest,
                value: applySimpleQuotesToString(value),
              }))}
              selectSizeVariant="small"
              withSearchInput={true}
            />
          </SettingsOptionCardContentSelect>
        )}
      />
      <Controller
        name="settings.format"
        control={control}
        defaultValue={initialSettingsValue.format}
        render={({ field: { onChange, value } }) => (
          <SettingsOptionCardContentSelect
            Icon={IconCheckbox}
            title={t`Format`}
            description={t`Choose between Short and Full`}
          >
            <Select<FieldCurrencyFormat>
              dropdownWidth={140}
              value={value}
              onChange={onChange}
              disabled={disabled}
              dropdownId="object-field-format-select"
              options={[
                { label: 'Short', value: 'short' },
                { label: 'Full', value: 'full' },
              ]}
              selectSizeVariant="small"
              withSearchInput={false}
            />
          </SettingsOptionCardContentSelect>
        )}
      />
    </>
  );
};
