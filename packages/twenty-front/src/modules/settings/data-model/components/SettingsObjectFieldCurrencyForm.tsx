import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import { SETTINGS_FIELD_CURRENCY_CODES } from '@/settings/data-model/constants/SettingsFieldCurrencyCodes';
import { Select } from '@/ui/input/components/Select';
import { CardContent } from '@/ui/layout/card/components/CardContent';

// TODO: rename to SettingsDataModelFieldCurrencyForm and move to settings/data-model/fields/forms/components

export const settingsDataModelFieldCurrencyFormSchema = z.object({
  defaultValue: z.object({
    currencyCode: z.nativeEnum(CurrencyCode),
  }),
});

type SettingsDataModelFieldCurrencyFormValues = z.infer<
  typeof settingsDataModelFieldCurrencyFormSchema
>;

type SettingsDataModelFieldCurrencyFormProps = {
  disabled?: boolean;
  fieldMetadataItem?: Pick<FieldMetadataItem, 'defaultValue'>;
};

const OPTIONS = Object.entries(SETTINGS_FIELD_CURRENCY_CODES).map(
  ([value, { label, Icon }]) => ({
    label,
    value: value as CurrencyCode,
    Icon,
  }),
);

export const SettingsDataModelFieldCurrencyForm = ({
  disabled,
  fieldMetadataItem,
}: SettingsDataModelFieldCurrencyFormProps) => {
  const { control } =
    useFormContext<SettingsDataModelFieldCurrencyFormValues>();

  const initialValue =
    (fieldMetadataItem?.defaultValue?.currencyCode as CurrencyCode) ??
    CurrencyCode.USD;

  return (
    <CardContent>
      <Controller
        name="defaultValue.currencyCode"
        control={control}
        defaultValue={initialValue}
        render={({ field: { onChange, value } }) => (
          <Select
            fullWidth
            disabled={disabled}
            label="Default Unit"
            dropdownId="currency-unit-select"
            value={value}
            options={OPTIONS}
            onChange={onChange}
          />
        )}
      />
    </CardContent>
  );
};
