import { Separator } from '@/settings/components/Separator';
import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';

import { SettingsDataModelFieldIsUniqueForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldIsUniqueForm';
import { SettingsDataModelFieldTextForm } from '@/settings/data-model/fields/forms/components/text/SettingsDataModelFieldTextForm';
import { SettingsDataModelFieldPreviewWidget } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewWidget';
import { useFormContext } from 'react-hook-form';
import { FieldMetadataType } from 'twenty-shared/types';

type SettingsDataModelFieldTextSettingsFormCardProps = {
  disabled?: boolean;
  existingFieldMetadataId: string;
  objectNameSingular: string;
};

export const SettingsDataModelFieldTextSettingsFormCard = ({
  disabled,
  existingFieldMetadataId,
  objectNameSingular,
}: SettingsDataModelFieldTextSettingsFormCardProps) => {
  const { watch } = useFormContext();

  return (
    <SettingsDataModelPreviewFormCard
      preview={
        <SettingsDataModelFieldPreviewWidget
          fieldMetadataItem={{
            label: watch('label'),
            icon: watch('icon'),
            type: FieldMetadataType.TEXT,
            settings: watch('settings'),
          }}
          objectNameSingular={objectNameSingular}
        />
      }
      form={
        <>
          <SettingsDataModelFieldTextForm
            disabled={disabled}
            existingFieldMetadataId={existingFieldMetadataId}
          />
          <Separator />
          <SettingsDataModelFieldIsUniqueForm
            fieldType={FieldMetadataType.TEXT}
            existingFieldMetadataId={existingFieldMetadataId}
            objectNameSingular={objectNameSingular}
            disabled={disabled}
          />
        </>
      }
    />
  );
};
