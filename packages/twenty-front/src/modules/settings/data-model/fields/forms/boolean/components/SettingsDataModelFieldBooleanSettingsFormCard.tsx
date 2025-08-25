import { useFormContext } from 'react-hook-form';

import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import {
  SettingsDataModelFieldBooleanForm,
  type SettingsDataModelFieldBooleanFormValues,
} from '@/settings/data-model/fields/forms/boolean/components/SettingsDataModelFieldBooleanForm';
import { SettingsDataModelFieldPreviewWidget } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewWidget';
import { FieldMetadataType } from 'twenty-shared/types';
import { type SettingsDataModelFieldEditFormValues } from '~/pages/settings/data-model/SettingsObjectFieldEdit';

type SettingsDataModelFieldBooleanSettingsFormCardProps = {
  existingFieldMetadataId: string;
  objectNameSingular: string;
};

export const SettingsDataModelFieldBooleanSettingsFormCard = ({
  existingFieldMetadataId,
  objectNameSingular,
}: SettingsDataModelFieldBooleanSettingsFormCardProps) => {
  const { watch } = useFormContext<
    SettingsDataModelFieldBooleanFormValues &
      SettingsDataModelFieldEditFormValues
  >();

  return (
    <SettingsDataModelPreviewFormCard
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
      form={
        <SettingsDataModelFieldBooleanForm
          existingFieldMetadataId={existingFieldMetadataId}
        />
      }
    />
  );
};
