import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { numberFieldDefaultValueSchema } from '@/object-record/record-field/validation-schemas/numberFieldDefaultValueSchema';
import { SettingsOptionCardContent } from '@/settings/components/SettingsOptionCardContent';
import { IllustrationIconDecimal } from 'twenty-ui';
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
      }}
      control={control}
      render={({ field: { onChange, value } }) => {
        const count = value?.decimals ?? 0;

        return (
          <SettingsOptionCardContent
            variant="counter"
            Icon={IllustrationIconDecimal}
            title="Number of decimals"
            description="Set the number of decimal places"
            value={count}
            onChange={(value) => onChange({ decimals: value })}
            disabled={disabled}
            exampleValue={1000}
          />
        );
      }}
    />
  );
};
