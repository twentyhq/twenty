import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
// import { dateFieldDefaultValueSchema } from '@/object-record/record-field/validation-schemas/dateFieldDefaultValueSchema';
import { Toggle } from '@/ui/input/components/Toggle';
import { CardContent } from '@/ui/layout/card/components/CardContent';

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
  const { control } = useFormContext<SettingsDataModelFieldDateFormValues>();

  // const { dislpayAsRelativeDate } = useDateSettingsFormInitialValues({ fieldMetadataItem });

  return (
    <CardContent>
      <Controller
        name="settings.displayAsRelativeDate"
        control={control}
        defaultValue={false}
        render={({ field: { onChange, value } }) => (
          <div>
            Display as relative date
            <Toggle disabled={disabled} value={value} onChange={onChange} />
          </div>
        )}
      />
    </CardContent>
  );
};
