import { useFormContext } from 'react-hook-form';
import { FieldMetadataType } from 'twenty-shared/types';

import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import {
  SettingsDataModelFieldFullNameForm,
  type SettingsDataModelFieldFullNameFormValues,
} from '@/settings/data-model/fields/forms/full-name/components/SettingsDataModelFieldFullNameForm';
import { SettingsDataModelFieldPreviewWidget } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewWidget';
import { type SettingsDataModelFieldEditFormValues } from '~/pages/settings/data-model/SettingsObjectFieldEdit';

type SettingsDataModelFieldFullNameSettingsFormCardProps = {
  disabled?: boolean;
  existingFieldMetadataId: string;
  objectNameSingular: string;
};

export const SettingsDataModelFieldFullNameSettingsFormCard = ({
  disabled,
  existingFieldMetadataId,
  objectNameSingular,
}: SettingsDataModelFieldFullNameSettingsFormCardProps) => {
  const { watch } = useFormContext<
    SettingsDataModelFieldFullNameFormValues &
      SettingsDataModelFieldEditFormValues
  >();
  return (
    <SettingsDataModelPreviewFormCard
      preview={
        <SettingsDataModelFieldPreviewWidget
          fieldMetadataItem={{
            icon: watch('icon'),
            label: watch('label'),
            type: FieldMetadataType.FULL_NAME,
            settings: {
              defaultSortSubField: watch('settings.defaultSortSubField'),
            },
          }}
          objectNameSingular={objectNameSingular}
        />
      }
      form={
        <SettingsDataModelFieldFullNameForm
          disabled={disabled}
          existingFieldMetadataId={existingFieldMetadataId}
        />
      }
    />
  );
};
