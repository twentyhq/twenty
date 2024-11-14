import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { numberFieldDefaultValueSchema } from '@/object-record/record-field/validation-schemas/numberFieldDefaultValueSchema';
import { SettingsOptionCardContent } from '@/settings/components/SettingsOptionCardContent';
import {
  IconNumber9,
  IconPercentage,
  IllustrationIconDecimal,
  IllustrationIconEye,
} from 'twenty-ui';
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
            <SettingsOptionCardContent
              variant="select"
              Icon={IllustrationIconEye}
              dropdownId="number-type"
              title="Number type"
              description="The number type you want to use, e.g. percentage"
              value={type}
              onChange={(value) => onChange({ type: value, decimals: count })}
              disabled={disabled}
              options={[
                {
                  label: 'Number',
                  value: 'number',
                  Icon: IconNumber9,
                },
                {
                  label: 'Percentage',
                  value: 'percentage',
                  Icon: IconPercentage,
                },
              ]}
            />
            <SettingsOptionCardContent
              variant="counter"
              Icon={IllustrationIconDecimal}
              title="Number of decimals"
              description="Set the number of decimal places"
              value={count}
              onChange={(value) => onChange({ type: type, decimals: value })}
              disabled={disabled}
              exampleValue={1000}
            />
          </>
        );
      }}
    />
  );
};
