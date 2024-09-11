import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { fieldMetadataItemSchema } from '@/object-metadata/validation-schemas/fieldMetadataItemSchema';

import { TextArea } from '@/ui/input/components/TextArea';

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

  return (
    <Controller
      name="description"
      control={control}
      defaultValue={fieldMetadataItem?.description}
      render={({ field: { onChange, value } }) => (
        <TextArea
          placeholder="Write a description"
          minRows={4}
          value={value ?? undefined}
          onChange={onChange}
          disabled={disabled}
        />
      )}
    />
  );
};
