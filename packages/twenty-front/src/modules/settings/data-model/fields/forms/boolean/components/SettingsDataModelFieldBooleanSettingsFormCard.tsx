import styled from '@emotion/styled';
import { useFormContext } from 'react-hook-form';

import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import {
  SettingsDataModelFieldBooleanForm,
  type SettingsDataModelFieldBooleanFormValues,
} from '@/settings/data-model/fields/forms/boolean/components/SettingsDataModelFieldBooleanForm';
import { useBooleanSettingsFormInitialValues } from '@/settings/data-model/fields/forms/boolean/hooks/useBooleanSettingsFormInitialValues';
import { SettingsDataModelFieldPreviewCard } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewCard';
import { FieldMetadataType } from 'twenty-shared/types';
import { type SettingsDataModelFieldEditFormValues } from '~/pages/settings/data-model/SettingsObjectFieldEdit';

type SettingsDataModelFieldBooleanSettingsFormCardProps = {
  existingFieldMetadataId: string;
  objectNameSingular: string;
};

const StyledFieldPreviewCard = styled(SettingsDataModelFieldPreviewCard)`
  display: grid;
  flex: 1 1 100%;
`;

export const SettingsDataModelFieldBooleanSettingsFormCard = ({
  existingFieldMetadataId,
  objectNameSingular,
}: SettingsDataModelFieldBooleanSettingsFormCardProps) => {
  const { initialDefaultValue } = useBooleanSettingsFormInitialValues({
    existingFieldMetadataId,
  });

  const { watch } = useFormContext<
    SettingsDataModelFieldBooleanFormValues &
      SettingsDataModelFieldEditFormValues
  >();

  return (
    <SettingsDataModelPreviewFormCard
      preview={
        <StyledFieldPreviewCard
          fieldMetadataItem={{
            type: FieldMetadataType.BOOLEAN,
            label: watch('label'),
            icon: watch('icon'),
            defaultValue: watch('defaultValue', initialDefaultValue),
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
