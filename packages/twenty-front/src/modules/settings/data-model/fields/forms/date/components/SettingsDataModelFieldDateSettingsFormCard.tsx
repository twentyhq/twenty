import { useFormContext } from 'react-hook-form';

import { Separator } from '@/settings/components/Separator';
import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import { SettingsDataModelFieldIsUniqueForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldIsUniqueForm';
import {
  SettingsDataModelFieldDateForm,
  type SettingsDataModelFieldDateFormValues,
} from '@/settings/data-model/fields/forms/date/components/SettingsDataModelFieldDateForm';
import { SettingsDataModelFieldPreviewWidget } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewWidget';
import { type FieldMetadataType } from 'twenty-shared/types';
import { type SettingsDataModelFieldEditFormValues } from '~/pages/settings/data-model/SettingsObjectFieldEdit';

type SettingsDataModelFieldDateSettingsFormCardProps = {
  disabled?: boolean;
  fieldType: FieldMetadataType.DATE_TIME | FieldMetadataType.DATE;
  existingFieldMetadataId: string;
  objectNameSingular: string;
};

export const SettingsDataModelFieldDateSettingsFormCard = ({
  disabled,
  fieldType,
  existingFieldMetadataId,
  objectNameSingular,
}: SettingsDataModelFieldDateSettingsFormCardProps) => {
  const { watch } = useFormContext<
    SettingsDataModelFieldDateFormValues & SettingsDataModelFieldEditFormValues
  >();

  return (
    <SettingsDataModelPreviewFormCard
      preview={
        <SettingsDataModelFieldPreviewWidget
          fieldMetadataItem={{
            type: fieldType,
            label: watch('label'),
            icon: watch('icon'),
            settings: {
              displayFormat: watch('settings.displayFormat'),
              customUnicodeDateFormat: watch(
                'settings.customUnicodeDateFormat',
              ),
            },
          }}
          objectNameSingular={objectNameSingular}
        />
      }
      form={
        <>
          <SettingsDataModelFieldDateForm
            disabled={disabled}
            existingFieldMetadataId={existingFieldMetadataId}
          />
          <Separator />
          <SettingsDataModelFieldIsUniqueForm
            fieldType={fieldType}
            existingFieldMetadataId={existingFieldMetadataId}
            objectNameSingular={objectNameSingular}
            disabled={disabled}
          />
        </>
      }
    />
  );
};
