import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { numberFieldDefaultValueSchema } from '@/object-record/record-field/validation-schemas/numberFieldDefaultValueSchema';
import { Separator } from '@/settings/components/Separator';
import { SettingsOptionCardContentCounter } from '@/settings/components/SettingsOptions/SettingsOptionCardContentCounter';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { Select } from '@/ui/input/components/Select';
import { IconDecimal, IconEye, IconNumber9, IconPercentage } from 'twenty-ui';
import { DEFAULT_DECIMAL_VALUE } from '~/utils/format/number';

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
              title="Number type"
              description="Display as a plain number or a percentage"
            >
              <Select<string>
                selectSizeVariant="small"
                dropdownId="number-type"
                dropdownWidth={120}
                value={type}
                onChange={(value) => onChange({ type: value, decimals: count })}
                disabled={disabled}
                needIconCheck={false}
                options={[
                  {
                    Icon: IconNumber9,
                    label: 'Number',
                    value: 'number',
                  },
                  {
                    Icon: IconPercentage,
                    label: 'Percentage',
                    value: 'percentage',
                  },
                ]}
              />
            </SettingsOptionCardContentSelect>
            <Separator />
            <SettingsOptionCardContentCounter
              Icon={IconDecimal}
              title="Number of decimals"
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
