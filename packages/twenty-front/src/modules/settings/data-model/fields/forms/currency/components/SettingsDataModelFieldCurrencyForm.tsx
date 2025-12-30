import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import {
  fieldMetadataCurrencyFormat,
  type FieldCurrencyFormat,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { currencyFieldDefaultValueSchema } from '@/object-record/record-field/ui/validation-schemas/currencyFieldDefaultValueSchema';
import { currencyFieldSettingsSchema } from '@/object-record/record-field/ui/validation-schemas/currencyFieldSettingsSchema';
import { Separator } from '@/settings/components/Separator';
import { SettingsOptionCardContentCounter } from '@/settings/components/SettingsOptions/SettingsOptionCardContentCounter';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { CURRENCIES } from '@/settings/data-model/constants/Currencies';
import { useCurrencySettingsFormInitialValues } from '@/settings/data-model/fields/forms/currency/hooks/useCurrencySettingsFormInitialValues';
import { Select } from '@/ui/input/components/Select';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import {
  IconCheckbox,
  IconCurrencyDollar,
  IconDecimal,
} from 'twenty-ui/display';
import { DEFAULT_DECIMAL_VALUE } from '~/utils/format/formatNumber';
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
  existingFieldMetadataId: string;
};

export const SettingsDataModelFieldCurrencyForm = ({
  disabled,
  existingFieldMetadataId,
}: SettingsDataModelFieldCurrencyFormProps) => {
  const { t } = useLingui();
  const {
    initialAmountMicrosValue,
    initialCurrencyCodeValue,
    initialSettingsValue,
  } = useCurrencySettingsFormInitialValues({
    existingFieldMetadataId,
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
      <Separator />
      <Controller
        name="settings"
        control={control}
        defaultValue={initialSettingsValue}
        render={({ field: { onChange, value } }) => {
          const format = value?.format ?? fieldMetadataCurrencyFormat[0];
          const decimals = value?.decimals ?? DEFAULT_DECIMAL_VALUE;

          return (
            <>
              <SettingsOptionCardContentSelect
                Icon={IconCheckbox}
                title={t`Format`}
                description={t`Choose between Short and Full`}
              >
                <Select<FieldCurrencyFormat>
                  dropdownWidth={140}
                  value={format}
                  onChange={(newFormat) =>
                    onChange({
                      format: newFormat,
                      decimals:
                        newFormat === fieldMetadataCurrencyFormat[0]
                          ? DEFAULT_DECIMAL_VALUE
                          : decimals,
                    })
                  }
                  disabled={disabled}
                  dropdownId="object-field-format-select"
                  options={[
                    { label: 'Short', value: fieldMetadataCurrencyFormat[0] },
                    { label: 'Full', value: fieldMetadataCurrencyFormat[1] },
                  ]}
                  selectSizeVariant="small"
                  withSearchInput={false}
                />
              </SettingsOptionCardContentSelect>
              <Separator />
              {format === 'full' && (
                <SettingsOptionCardContentCounter
                  Icon={IconDecimal}
                  title={t`Number of decimals`}
                  description={plural(decimals, {
                    one: `E.g. ${(1000).toFixed(decimals)} for ${decimals} decimal`,
                    other: `E.g. ${(1000).toFixed(decimals)} for ${decimals} decimals`,
                  })}
                  value={decimals}
                  onChange={(newDecimals: number) =>
                    onChange({ format, decimals: newDecimals })
                  }
                  disabled={disabled}
                  minValue={0}
                  maxValue={5}
                />
              )}
            </>
          );
        }}
      />
    </>
  );
};
