import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { numberFieldDefaultValueSchema } from '@/object-record/record-field/validation-schemas/numberFieldDefaultValueSchema';
import { Separator } from '@/settings/components/Separator';
import { SettingsOptionCardContentCounter } from '@/settings/components/SettingsOptions/SettingsOptionCardContentCounter';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { Select } from '@/ui/input/components/Select';
import { useLingui } from '@lingui/react/macro';
import { IconDecimal, IconEye } from 'twenty-ui/display';
import { DEFAULT_DECIMAL_VALUE } from '~/utils/format/number';
import { NUMBER_DATA_MODEL_SELECT_OPTIONS } from '@/settings/data-model/fields/forms/number/constants/NumberDataModelSelectOptions';

export const settingsDataModelFieldNumberFormSchema = z.object({
  settings: numberFieldDefaultValueSchema,
});

export type SettingsDataModelFieldNumberFormValues = z.infer<
  typeof settingsDataModelFieldNumberFormSchema
>;

type SettingsDataModelFieldNumberFormProps = {
  disabled?: boolean;
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'icon' | 'label' | 'type' | 'defaultValue' | 'settings'
  >;
};

export const SettingsDataModelFieldNumberForm = ({
  disabled,
  fieldMetadataItem,
}: SettingsDataModelFieldNumberFormProps) => {
  const { t } = useLingui();
  const { control } = useFormContext<SettingsDataModelFieldNumberFormValues>();

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
                onChange={(value) => onChange({ type: value, decimals: count })}
                disabled={disabled}
                needIconCheck={false}
                options={NUMBER_DATA_MODEL_SELECT_OPTIONS.map((option) => ({
                  ...option,
                  label: t(option.label),
                }))}
              />
            </SettingsOptionCardContentSelect>
            <Separator />
            <SettingsOptionCardContentCounter
              Icon={IconDecimal}
              title={t`Number of decimals`}
              description={`E.g. ${(type === 'percentage' ? 99 : 1000).toFixed(count)}${type === 'percentage' ? '%' : ''} for ${count} decimal${count > 1 ? 's' : ''}`}
              value={count}
              onChange={(value) => onChange({ type: type, decimals: value })}
              disabled={disabled}
              minValue={0}
              maxValue={100} // needs to be changed
            />
          </>
        );
      }}
    />
  );
};
