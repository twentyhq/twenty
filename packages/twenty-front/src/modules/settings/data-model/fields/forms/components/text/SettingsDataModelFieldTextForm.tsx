import { Controller, useFormContext } from 'react-hook-form';

import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { TEXT_DATA_MODEL_SELECT_OPTIONS } from '@/settings/data-model/fields/forms/components/text/constants/TextDataModelSelectOptions';
import { Select } from '@/ui/input/components/Select';
import { useLingui } from '@lingui/react/macro';
import { IconTextWrap } from 'twenty-ui/display';
import { z } from 'zod';

type SettingsDataModelFieldTextFormProps = {
  disabled?: boolean;
  existingFieldMetadataId: string;
};

const textFieldDefaultValueSchema = z.object({
  displayedMaxRows: z.number().nullable(),
});

export const settingsDataModelFieldTextFormSchema = z.object({
  settings: textFieldDefaultValueSchema,
});

export type SettingsDataModelFieldTextFormValues = z.infer<
  typeof settingsDataModelFieldTextFormSchema
>;

export const SettingsDataModelFieldTextForm = ({
  disabled,
  existingFieldMetadataId,
}: SettingsDataModelFieldTextFormProps) => {
  const { t } = useLingui();

  const { fieldMetadataItem: existingFieldMetadataItem } =
    useFieldMetadataItemById(existingFieldMetadataId);

  const { control } = useFormContext<SettingsDataModelFieldTextFormValues>();
  return (
    <Controller
      name="settings"
      defaultValue={{
        displayedMaxRows:
          existingFieldMetadataItem?.settings?.displayedMaxRows || 0,
      }}
      control={control}
      render={({ field: { onChange, value } }) => {
        const displayedMaxRows = value?.displayedMaxRows ?? 0;

        return (
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
        );
      }}
    />
  );
};
