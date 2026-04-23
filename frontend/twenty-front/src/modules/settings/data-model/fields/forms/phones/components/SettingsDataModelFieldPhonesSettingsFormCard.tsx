import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';

import { Separator } from '@/settings/components/Separator';
import { SettingsDataModelFieldIsUniqueForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldIsUniqueForm';
import { SettingsDataModelFieldMaxValuesForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldMaxValuesForm';
import { SettingsDataModelFieldOnClickActionForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldOnClickActionForm';
import {
  SettingsDataModelFieldPhonesForm,
  type SettingsDataModelFieldPhonesFormValues,
} from '@/settings/data-model/fields/forms/phones/components/SettingsDataModelFieldPhonesForm';
import { SettingsDataModelFieldPreviewWidget } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewWidget';
import { useFormContext } from 'react-hook-form';
import { FieldMetadataType } from 'twenty-shared/types';
import { type SettingsDataModelFieldEditFormValues } from '~/pages/settings/data-model/SettingsObjectFieldEdit';

type SettingsDataModelFieldPhonesSettingsFormCardProps = {
  disabled?: boolean;
  existingFieldMetadataId: string;
  objectNameSingular: string;
};

export const SettingsDataModelFieldPhonesSettingsFormCard = ({
  disabled,
  existingFieldMetadataId,
  objectNameSingular,
}: SettingsDataModelFieldPhonesSettingsFormCardProps) => {
  const { watch } = useFormContext<
    SettingsDataModelFieldPhonesFormValues &
      SettingsDataModelFieldEditFormValues
  >();

  return (
    <SettingsDataModelPreviewFormCard
      preview={
        <SettingsDataModelFieldPreviewWidget
          fieldMetadataItem={{
            type: FieldMetadataType.PHONES,
            label: watch('label'),
            icon: watch('icon'),
            settings: watch('settings') ?? null,
          }}
          objectNameSingular={objectNameSingular}
        />
      }
      form={
        <>
          <SettingsDataModelFieldPhonesForm
            disabled={disabled}
            existingFieldMetadataId={existingFieldMetadataId}
          />
          <Separator />
          <SettingsDataModelFieldMaxValuesForm
            disabled={disabled}
            existingFieldMetadataId={existingFieldMetadataId}
            fieldType={FieldMetadataType.PHONES}
          />
          <Separator />
          <SettingsDataModelFieldOnClickActionForm
            disabled={disabled}
            existingFieldMetadataId={existingFieldMetadataId}
            fieldType={FieldMetadataType.PHONES}
          />
          <Separator />
          <SettingsDataModelFieldIsUniqueForm
            fieldType={FieldMetadataType.PHONES}
            existingFieldMetadataId={existingFieldMetadataId}
            objectNameSingular={objectNameSingular}
            disabled={disabled}
          />
        </>
      }
    />
  );
};
