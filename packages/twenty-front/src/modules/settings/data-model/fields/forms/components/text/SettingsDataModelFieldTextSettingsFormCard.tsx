import { SettingsCardSeparator } from '@/settings/components/SettingsCardSeparator';
import { SettingsPreviewCard } from '@/settings/components/SettingsPreviewCard';

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
    <SettingsPreviewCard
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
      content={
        <>
          <SettingsDataModelFieldTextForm
            disabled={disabled}
            existingFieldMetadataId={existingFieldMetadataId}
          />
          <SettingsCardSeparator />
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
