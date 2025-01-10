import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { fieldMetadataItemSchema } from '@/object-metadata/validation-schemas/fieldMetadataItemSchema';

import { TextArea } from '@/ui/input/components/TextArea';
import { useTranslation } from 'react-i18next';

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

  const { t } = useTranslation();
  
  return (
    <Controller
      name="description"
      control={control}
      defaultValue={fieldMetadataItem?.description}
      render={({ field: { onChange, value } }) => (
        <TextArea
          placeholder={t('writeDescription')}
          minRows={4}
          value={value ?? undefined}
          onChange={onChange}
          disabled={disabled}
        />
      )}
    />
  );
};
