import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import { currencyCodeSchema } from '@/object-record/record-field/validation-schemas/currencyCodeSchema';
import { SETTINGS_FIELD_CURRENCY_CODES } from '@/settings/data-model/constants/SettingsFieldCurrencyCodes';
import { Select } from '@/ui/input/components/Select';
import { CardContent } from '@/ui/layout/card/components/CardContent';
import { applySimpleQuotesToString } from '~/utils/string/applySimpleQuotesToString';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';
import { simpleQuotesStringSchema } from '~/utils/validation-schemas/simpleQuotesStringSchema';

export const settingsDataModelFieldCurrencyFormSchema = z.object({
  defaultValue: z.object({
    amountMicros: z.null(),
    currencyCode: simpleQuotesStringSchema.refine(
      (value) =>
        currencyCodeSchema.safeParse(stripSimpleQuotesFromString(value))
          .success,
      { message: 'String is not a valid currencyCode' },
    ),
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
    value: applySimpleQuotesToString(value),
    Icon,
  }),
);

export const SettingsDataModelFieldCurrencyForm = ({
  disabled,
  fieldMetadataItem,
}: SettingsDataModelFieldCurrencyFormProps) => {
  const { control, resetField } =
    useFormContext<SettingsDataModelFieldCurrencyFormValues>();

  const initialAmountMicrosValue = null;
  const initialCurrencyCode =
    (fieldMetadataItem?.defaultValue?.currencyCode as CurrencyCode) ??
    CurrencyCode.USD;
  const initialCurrencyCodeValue =
    applySimpleQuotesToString(initialCurrencyCode);

  // Reset defaultValue on mount, so it doesn't conflict with other field types.
  useEffect(() => {
    resetField('defaultValue', {
      defaultValue: {
        amountMicros: initialAmountMicrosValue,
        currencyCode: initialCurrencyCodeValue,
      },
    });
  }, [initialCurrencyCodeValue, resetField]);

  return (
    <CardContent>
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
