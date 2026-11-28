import { useFormContext } from 'react-hook-form';

import { SettingsPreviewCard } from '@/settings/components/SettingsPreviewCard';
import {
  SettingsDataModelFieldBooleanForm,
  type SettingsDataModelFieldBooleanFormValues,
} from '@/settings/data-model/fields/forms/boolean/components/SettingsDataModelFieldBooleanForm';
import { SettingsDataModelFieldPreviewWidget } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewWidget';
import { FieldMetadataType } from 'twenty-shared/types';
import { type SettingsDataModelFieldEditFormValues } from '@/settings/data-model/types/SettingsDataModelFieldEditFormValues';

type SettingsDataModelFieldBooleanSettingsFormCardProps = {
  existingFieldMetadataId: string;
  objectNameSingular: string;
  disabled?: boolean;
};

export const SettingsDataModelFieldBooleanSettingsFormCard = ({
  existingFieldMetadataId,
  objectNameSingular,
  disabled = false,
}: SettingsDataModelFieldBooleanSettingsFormCardProps) => {
  const { watch } = useFormContext<
    SettingsDataModelFieldBooleanFormValues &
      SettingsDataModelFieldEditFormValues
  >();

  return (
    <SettingsPreviewCard
      preview={
        <SettingsDataModelFieldPreviewWidget
          fieldMetadataItem={{
            type: FieldMetadataType.BOOLEAN,
            label: watch('label'),
            icon: watch('icon'),
            defaultValue: watch('defaultValue'),
          }}
          objectNameSingular={objectNameSingular}
        />
      }
      content={
        <SettingsDataModelFieldBooleanForm
          disabled={disabled}
          existingFieldMetadataId={existingFieldMetadataId}
        />
      }
    />
  );
};
