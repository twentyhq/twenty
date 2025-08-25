import styled from '@emotion/styled';

import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';

import { SettingsDataModelFieldIsUniqueForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldIsUniqueForm';
import {
  SettingsDataModelFieldPhonesForm,
  type SettingsDataModelFieldPhonesFormValues,
} from '@/settings/data-model/fields/forms/phones/components/SettingsDataModelFieldPhonesForm';
import { SettingsDataModelFieldPreviewCard } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewCard';
import { useFormContext } from 'react-hook-form';
import { FieldMetadataType } from 'twenty-shared/types';
import { type SettingsDataModelFieldEditFormValues } from '~/pages/settings/data-model/SettingsObjectFieldEdit';

type SettingsDataModelFieldPhonesSettingsFormCardProps = {
  disabled?: boolean;
  existingFieldMetadataId: string;
  objectNameSingular: string;
};

const StyledFieldPreviewCard = styled(SettingsDataModelFieldPreviewCard)`
  flex: 1 1 100%;
`;

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
        <StyledFieldPreviewCard
          fieldMetadataItem={{
            type: FieldMetadataType.PHONES,
            label: watch('label'),
            icon: watch('icon'),
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
          <SettingsDataModelFieldIsUniqueForm
            fieldType={FieldMetadataType.PHONES}
            existingFieldMetadataId={existingFieldMetadataId}
            objectNameSingular={objectNameSingular}
          />
        </>
      }
    />
  );
};
