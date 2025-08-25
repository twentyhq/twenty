import styled from '@emotion/styled';
import { useFormContext } from 'react-hook-form';

import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import { SettingsDataModelFieldIsUniqueForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldIsUniqueForm';
import {
  SettingsDataModelFieldDateForm,
  type SettingsDataModelFieldDateFormValues,
} from '@/settings/data-model/fields/forms/date/components/SettingsDataModelFieldDateForm';
import { SettingsDataModelFieldPreviewCard } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewCard';
import { type FieldMetadataType } from 'twenty-shared/types';
import { type SettingsDataModelFieldEditFormValues } from '~/pages/settings/data-model/SettingsObjectFieldEdit';

type SettingsDataModelFieldDateSettingsFormCardProps = {
  disabled?: boolean;
  fieldType: FieldMetadataType.DATE_TIME | FieldMetadataType.DATE;
  existingFieldMetadataId: string;
  objectNameSingular: string;
};

const StyledFieldPreviewCard = styled(SettingsDataModelFieldPreviewCard)`
  display: grid;
  flex: 1 1 100%;
`;

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
        <StyledFieldPreviewCard
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
          <SettingsDataModelFieldIsUniqueForm
            fieldType={fieldType}
            existingFieldMetadataId={existingFieldMetadataId}
            objectNameSingular={objectNameSingular}
          />
        </>
      }
    />
  );
};
