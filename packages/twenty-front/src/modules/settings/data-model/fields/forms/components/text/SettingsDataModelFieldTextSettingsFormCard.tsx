import styled from '@emotion/styled';

import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';

import { SettingsDataModelFieldIsUniqueForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldIsUniqueForm';
import { SettingsDataModelFieldTextForm } from '@/settings/data-model/fields/forms/components/text/SettingsDataModelFieldTextForm';
import { SettingsDataModelFieldPreviewCard } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewCard';
import { useFormContext } from 'react-hook-form';
import { FieldMetadataType } from 'twenty-shared/types';

type SettingsDataModelFieldTextSettingsFormCardProps = {
  disabled?: boolean;
  existingFieldMetadataId: string;
  objectNameSingular: string;
};

const StyledFieldPreviewCard = styled(SettingsDataModelFieldPreviewCard)`
  flex: 1 1 100%;
`;

export const SettingsDataModelFieldTextSettingsFormCard = ({
  disabled,
  existingFieldMetadataId,
  objectNameSingular,
}: SettingsDataModelFieldTextSettingsFormCardProps) => {
  const { watch } = useFormContext();

  return (
    <SettingsDataModelPreviewFormCard
      preview={
        <StyledFieldPreviewCard
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
          <SettingsDataModelFieldIsUniqueForm
            fieldType={FieldMetadataType.TEXT}
            existingFieldMetadataId={existingFieldMetadataId}
            objectNameSingular={objectNameSingular}
          />
        </>
      }
    />
  );
};
