import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { useDateSettingsFormInitialValues } from '@/settings/data-model/fields/forms/date/hooks/useDateSettingsFormInitialValues';
import { useLingui } from '@lingui/react/macro';
import { IconSlash } from 'twenty-ui';

export const settingsDataModelFieldDateFormSchema = z.object({
  settings: z
    .object({
      displayAsRelativeDate: z.boolean().optional(),
    })
    .optional(),
});

export type SettingsDataModelFieldDateFormValues = z.infer<
  typeof settingsDataModelFieldDateFormSchema
>;

type SettingsDataModelFieldDateFormProps = {
  disabled?: boolean;
  fieldMetadataItem: Pick<FieldMetadataItem, 'settings'>;
};

export const SettingsDataModelFieldDateForm = ({
  disabled,
  fieldMetadataItem,
}: SettingsDataModelFieldDateFormProps) => {
  const { t } = useLingui();

  const { control } = useFormContext<SettingsDataModelFieldDateFormValues>();

  const { initialDisplayAsRelativeDateValue } =
    useDateSettingsFormInitialValues({
      fieldMetadataItem,
    });

  return (
    <Controller
      name="settings.displayAsRelativeDate"
      control={control}
      defaultValue={initialDisplayAsRelativeDateValue}
      render={({ field: { onChange, value } }) => (
        <SettingsOptionCardContentToggle
          Icon={IconSlash}
          title={t`Display as relative date`}
          checked={value ?? false}
          disabled={disabled}
          onChange={onChange}
        />
      )}
    />
  );
};
