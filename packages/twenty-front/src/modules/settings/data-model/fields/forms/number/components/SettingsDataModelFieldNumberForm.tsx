import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { numberFieldDefaultValueSchema } from '@/object-record/record-field/ui/validation-schemas/numberFieldDefaultValueSchema';
import { Separator } from '@/settings/components/Separator';
import { SettingsOptionCardContentCounter } from '@/settings/components/SettingsOptions/SettingsOptionCardContentCounter';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { NUMBER_DATA_MODEL_SELECT_OPTIONS } from '@/settings/data-model/fields/forms/number/constants/NumberDataModelSelectOptions';
import { Select } from '@/ui/input/components/Select';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { IconDecimal, IconEye } from 'twenty-ui/display';
import { DEFAULT_DECIMAL_VALUE } from '~/utils/format/formatNumber';

export const settingsDataModelFieldNumberFormSchema = z.object({
  settings: numberFieldDefaultValueSchema,
});

export type SettingsDataModelFieldNumberFormValues = z.infer<
  typeof settingsDataModelFieldNumberFormSchema
>;

type SettingsDataModelFieldNumberFormProps = {
  disabled?: boolean;
  existingFieldMetadataId: string;
};

export const SettingsDataModelFieldNumberForm = ({
  disabled,
  existingFieldMetadataId,
}: SettingsDataModelFieldNumberFormProps) => {
  const { t } = useLingui();
  const { control } = useFormContext<SettingsDataModelFieldNumberFormValues>();

  const { fieldMetadataItem } = useFieldMetadataItemById(
    existingFieldMetadataId,
  );

  return (
    <Controller
      name="settings"
      defaultValue={{
        decimals:
          fieldMetadataItem?.settings?.decimals ?? DEFAULT_DECIMAL_VALUE,
        type: fieldMetadataItem?.settings?.type ?? 'number',
      }}
      control={control}
      render={({ field: { onChange, value } }) => {
        const count = value?.decimals ?? 0;
        const type = value?.type ?? 'number';

        return (
          <>
            <SettingsOptionCardContentSelect
              Icon={IconEye}
              title={t`Number type`}
              description={t`Display as a plain number or a percentage`}
            >
              <Select<string>
                selectSizeVariant="small"
                dropdownId="number-type"
                dropdownWidth={120}
                value={type}
                onChange={(value) =>
                  onChange({
                    type: value,
                    decimals:
                      value === 'shortNumber' ? DEFAULT_DECIMAL_VALUE : count,
                  })
                }
                disabled={disabled}
                needIconCheck={false}
                options={NUMBER_DATA_MODEL_SELECT_OPTIONS.map((option) => ({
                  ...option,
                  label: t(option.label),
                }))}
              />
            </SettingsOptionCardContentSelect>
            <Separator />
            {type !== 'shortNumber' && (
              <SettingsOptionCardContentCounter
                Icon={IconDecimal}
                title={t`Number of decimals`}
                description={plural(count, {
                  one: `E.g. ${(type === 'percentage' ? 99 : 1000).toFixed(count)}${type === 'percentage' ? '%' : ''} for ${count} decimal`,
                  other: `E.g. ${(type === 'percentage' ? 99 : 1000).toFixed(count)}${type === 'percentage' ? '%' : ''} for ${count} decimals`,
                })}
                value={count}
                onChange={(value) => onChange({ type: type, decimals: value })}
                disabled={disabled}
                minValue={0}
                maxValue={100} // needs to be changed
              />
            )}
          </>
        );
      }}
    />
  );
};
