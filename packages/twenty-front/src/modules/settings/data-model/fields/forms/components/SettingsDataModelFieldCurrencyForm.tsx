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
        defaultValue={applySimpleQuotesToString(initialValue)}
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
