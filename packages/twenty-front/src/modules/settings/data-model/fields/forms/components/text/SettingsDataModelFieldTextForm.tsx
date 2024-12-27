import { Controller, useFormContext } from 'react-hook-form';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { Select } from '@/ui/input/components/Select';
import { IconTextWrap } from 'twenty-ui';
import { z } from 'zod';

type SettingsDataModelFieldTextFormProps = {
  disabled?: boolean;
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'icon' | 'label' | 'type' | 'defaultValue' | 'settings'
  >;
};

export const textFieldDefaultValueSchema = z.object({
  displayedMaxRows: z.number().nullable(),
});

export const settingsDataModelFieldtextFormSchema = z.object({
  settings: textFieldDefaultValueSchema,
});

export type SettingsDataModelFieldTextFormValues = z.infer<
  typeof settingsDataModelFieldtextFormSchema
>;

export const SettingsDataModelFieldTextForm = ({
  disabled,
  fieldMetadataItem,
}: SettingsDataModelFieldTextFormProps) => {
  const { control } = useFormContext<SettingsDataModelFieldTextFormValues>();
  return (
    <Controller
      name="settings"
      defaultValue={{
        displayedMaxRows: fieldMetadataItem?.settings?.displayedMaxRows || 0,
      }}
      control={control}
      render={({ field: { onChange, value } }) => {
        const displayedMaxRows = value?.displayedMaxRows ?? 0;

        return (
          <>
            <SettingsOptionCardContentSelect
              Icon={IconTextWrap}
              title="Wrap on record pages"
              description="Display text on multiple lines"
            >
              <Select<number>
                dropdownId="text-wrap"
                value={displayedMaxRows}
                onChange={(value) => onChange({ displayedMaxRows: value })}
                disabled={disabled}
                options={[
                  {
                    label: 'Deactivated',
                    value: 0,
                  },
                  {
                    label: 'First 2 lines',
                    value: 2,
                  },
                  {
                    label: 'First 5 lines',
                    value: 5,
                  },
                  {
                    label: 'First 10 lines',
                    value: 10,
                  },
                  {
                    label: 'All lines',
                    value: 99,
                  },
                ]}
                selectSizeVariant="small"
              />
            </SettingsOptionCardContentSelect>
          </>
        );
      }}
    />
  );
};
