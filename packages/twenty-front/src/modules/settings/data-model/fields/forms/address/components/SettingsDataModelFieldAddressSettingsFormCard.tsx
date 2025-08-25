import styled from '@emotion/styled';

import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import {
  SettingsDataModelFieldAddressForm,
  type SettingsDataModelFieldTextFormValues,
} from '@/settings/data-model/fields/forms/address/components/SettingsDataModelFieldAddressForm';
import { SettingsDataModelFieldPreviewCard } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewCard';
import { useFormContext } from 'react-hook-form';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { type SettingsDataModelFieldEditFormValues } from '~/pages/settings/data-model/SettingsObjectFieldEdit';

type SettingsDataModelFieldAddressSettingsFormCardProps = {
  disabled?: boolean;
  existingFieldMetadataId: string;
  objectNameSingular: string;
};

const StyledFieldPreviewCard = styled(SettingsDataModelFieldPreviewCard)`
  flex: 1 1 100%;
`;

export const SettingsDataModelFieldAddressSettingsFormCard = ({
  disabled,
  existingFieldMetadataId,
  objectNameSingular,
}: SettingsDataModelFieldAddressSettingsFormCardProps) => {
  const { watch } = useFormContext<
    SettingsDataModelFieldTextFormValues & SettingsDataModelFieldEditFormValues
  >();
  return (
    <SettingsDataModelPreviewFormCard
      preview={
        <StyledFieldPreviewCard
          fieldMetadataItem={{
            icon: watch('icon'),
            label: watch('label'),
            type: FieldMetadataType.ADDRESS,
            settings: {
              subFields: watch('settings.subFields'),
            },
          }}
          objectNameSingular={objectNameSingular}
        />
      }
      form={
        <SettingsDataModelFieldAddressForm
          disabled={disabled}
          existingFieldMetadataId={existingFieldMetadataId}
        />
      }
    />
  );
};
