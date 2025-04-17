import { Controller, useFormContext } from 'react-hook-form';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { TEXT_DATA_MODEL_SELECT_OPTIONS } from '@/settings/data-model/fields/forms/components/text/constants/TextDataModelSelectOptions';
import { Select } from '@/ui/input/components/Select';
import { useLingui } from '@lingui/react/macro';
import { IconTextWrap } from 'twenty-ui/display';
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
  const { t } = useLingui();

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
              title={t`Wrap on record pages`}
              description={t`Display text on multiple lines`}
            >
              <Select<number>
                dropdownId="text-wrap"
                value={displayedMaxRows}
                onChange={(value) => onChange({ displayedMaxRows: value })}
                disabled={disabled}
                options={TEXT_DATA_MODEL_SELECT_OPTIONS.map((option) => ({
                  ...option,
                  label: t(option.label),
                }))}
                selectSizeVariant="small"
              />
            </SettingsOptionCardContentSelect>
          </>
        );
      }}
    />
  );
};
