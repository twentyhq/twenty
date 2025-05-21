import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { currencyFieldDefaultValueSchema } from '@/object-record/record-field/validation-schemas/currencyFieldDefaultValueSchema';
import { Separator } from '@/settings/components/Separator';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { CURRENCIES } from '@/settings/data-model/constants/Currencies';
import { useCurrencySettingsFormInitialValues } from '@/settings/data-model/fields/forms/currency/hooks/useCurrencySettingsFormInitialValues';
import { Select } from '@/ui/input/components/Select';
import { useLingui } from '@lingui/react/macro';
import { IconCurrencyDollar } from 'twenty-ui/display';
import { applySimpleQuotesToString } from '~/utils/string/applySimpleQuotesToString';
import { SettingsDataModelFieldCurrencyFormatForm } from './SettingsDataModelFieldCurrencyFormatForm';

export const settingsDataModelFieldCurrencyFormSchema = z.object({
  defaultValue: currencyFieldDefaultValueSchema,
  settings: z.object({
    format: z.enum(['short', 'full']),
  }),
});

export type SettingsDataModelFieldCurrencyFormValues = z.infer<
  typeof settingsDataModelFieldCurrencyFormSchema
>;

type SettingsDataModelFieldCurrencyFormProps = {
  disabled?: boolean;
  fieldMetadataItem: Pick<FieldMetadataItem, 'defaultValue' | 'settings'>;
};

export const SettingsDataModelFieldCurrencyForm = ({
  disabled,
  fieldMetadataItem,
}: SettingsDataModelFieldCurrencyFormProps) => {
  const { t } = useLingui();
  const { control } = useFormContext<SettingsDataModelFieldCurrencyFormValues>();

  const { initialAmountMicrosValue, initialCurrencyCodeValue } =
    useCurrencySettingsFormInitialValues({ fieldMetadataItem });

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
      <Separator />
      <SettingsDataModelFieldCurrencyFormatForm
        disabled={disabled}
        fieldMetadataItem={fieldMetadataItem}
      />
    </>
  );
};
