import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldDateDisplayFormat } from '@/object-record/record-field/types/FieldMetadata';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { useDateSettingsFormInitialValues } from '@/settings/data-model/fields/forms/date/hooks/useDateSettingsFormInitialValues';
import { Select } from '@/ui/input/components/Select';
import { useLingui } from '@lingui/react/macro';
import { IconSlash } from 'twenty-ui/display';

const displayFormatsToLabelMap: Record<FieldDateDisplayFormat, string> = {
  'full_date': 'Full Date',
  'relative_date': 'Relative Date',
  'date': 'Date',
  'time': 'Time',
  'year': 'Year',
  'custom': 'Custom'
} as const

const displayFormats = Object.keys(displayFormatsToLabelMap) as [keyof typeof displayFormatsToLabelMap];

export const settingsDataModelFieldDateFormSchema = z.object({
  settings: z
    .object({
      displayFormat: z.enum(displayFormats).optional(),
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

  const { initialDisplayFormat } =
    useDateSettingsFormInitialValues({
      fieldMetadataItem,
    });

  return (
    <Controller
      name="settings.displayFormat"
      control={control}
      defaultValue={initialDisplayFormat}
      render={({ field: { onChange, value } }) => (
        <SettingsOptionCardContentSelect
          Icon={IconSlash}
          title={t`Display Format`}
          disabled={disabled}
          description={t`Choose the format used to display date value`}
        >
          <Select<FieldDateDisplayFormat>
              disabled={disabled}
              selectSizeVariant="small"
              dropdownWidth={120}
              dropdownId="selectFieldDateDisplayFormat"
              value={value}
              onChange={onChange}
              options={Object.entries(displayFormatsToLabelMap).map((format) => (
                {
                  label: t`${format[1]}`,
                  value: format[0] as FieldDateDisplayFormat
                }
              ))} 
          />
        </SettingsOptionCardContentSelect>
      )}
    />
  );
};
