import styled from '@emotion/styled';

import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import { SettingsDataModelFieldIsUniqueForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldIsUniqueForm';
import { SettingsDataModelFieldNumberForm } from '@/settings/data-model/fields/forms/number/components/SettingsDataModelFieldNumberForm';
import { SettingsDataModelFieldPreviewCard } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewCard';
import { useFormContext } from 'react-hook-form';
import { FieldMetadataType } from 'twenty-shared/types';

type SettingsDataModelFieldNumberSettingsFormCardProps = {
  disabled?: boolean;
  existingFieldMetadataId: string;
  objectNameSingular: string;
};

const StyledFieldPreviewCard = styled(SettingsDataModelFieldPreviewCard)`
  display: grid;
  flex: 1 1 100%;
`;

export const SettingsDataModelFieldNumberSettingsFormCard = ({
  disabled,
  existingFieldMetadataId,
  objectNameSingular,
}: SettingsDataModelFieldNumberSettingsFormCardProps) => {
  const { watch } = useFormContext();

  return (
    <SettingsDataModelPreviewFormCard
      preview={
        <StyledFieldPreviewCard
          fieldMetadataItem={{
            icon: watch('icon'),
            label: watch('label') || 'New Field',
            settings: watch('settings') || null,
            type: FieldMetadataType.NUMBER,
          }}
          objectNameSingular={objectNameSingular}
        />
      }
      form={
        <>
          <SettingsDataModelFieldNumberForm
            disabled={disabled}
            existingFieldMetadataId={existingFieldMetadataId}
          />

          <SettingsDataModelFieldIsUniqueForm
            fieldType={FieldMetadataType.NUMBER}
            existingFieldMetadataId={existingFieldMetadataId}
            objectNameSingular={objectNameSingular}
          />
        </>
      }
    />
  );
};
