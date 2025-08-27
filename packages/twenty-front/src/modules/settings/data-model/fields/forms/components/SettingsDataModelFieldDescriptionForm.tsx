import { Controller, useFormContext } from 'react-hook-form';
import { type z } from 'zod';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { fieldMetadataItemSchema } from '@/object-metadata/validation-schemas/fieldMetadataItemSchema';

import { TextArea } from '@/ui/input/components/TextArea';
import { t } from '@lingui/core/macro';

export const settingsDataModelFieldDescriptionFormSchema = () => {
  return fieldMetadataItemSchema([]).pick({
    description: true,
  });
};

type SettingsDataModelFieldDescriptionFormValues = z.infer<
  ReturnType<typeof settingsDataModelFieldDescriptionFormSchema>
>;

type SettingsDataModelFieldDescriptionFormProps = {
  disabled?: boolean;
  fieldMetadataItem?: FieldMetadataItem;
};

export const SettingsDataModelFieldDescriptionForm = ({
  disabled,
  fieldMetadataItem,
}: SettingsDataModelFieldDescriptionFormProps) => {
  const { control } =
    useFormContext<SettingsDataModelFieldDescriptionFormValues>();

  const descriptionTextAreaId = `${fieldMetadataItem?.id}-description`;

  return (
    <Controller
      name="description"
      control={control}
      defaultValue={fieldMetadataItem?.description}
      render={({ field: { onChange, value } }) => (
        <TextArea
          textAreaId={descriptionTextAreaId}
          placeholder={t`Write a description`}
          minRows={4}
          value={value ?? undefined}
          onChange={onChange}
          disabled={disabled}
        />
      )}
    />
  );
};
