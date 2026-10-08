import { SettingsDataModelFieldRawJsonForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldRawJsonForm';
import {
  settingsDataModelFieldRawJsonSchema,
  type SettingsDataModelFieldRawJsonFormValues,
} from '@/settings/data-model/fields/forms/utils/settingsDataModelFieldRawJsonSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { Button } from 'twenty-ui/primitives/input';

type SettingsDataModelFieldRawJsonFormStoryProps = {
  existingFieldMetadataId: string;
  disabled?: boolean;
  onSubmit: (values: SettingsDataModelFieldRawJsonFormValues) => void;
};

export const SettingsDataModelFieldRawJsonFormStory = ({
  existingFieldMetadataId,
  disabled,
  onSubmit,
}: SettingsDataModelFieldRawJsonFormStoryProps) => {
  const form = useForm<SettingsDataModelFieldRawJsonFormValues>({
    resolver: zodResolver(settingsDataModelFieldRawJsonSchema),
  });

  return (
    // oxlint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <SettingsDataModelFieldRawJsonForm
          existingFieldMetadataId={existingFieldMetadataId}
          disabled={disabled}
        />
        <Button type="submit">Save</Button>
      </form>
    </FormProvider>
  );
};
