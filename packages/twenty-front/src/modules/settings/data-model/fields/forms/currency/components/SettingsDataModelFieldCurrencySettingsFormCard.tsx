import styled from '@emotion/styled';
import { useFormContext } from 'react-hook-form';

import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import {
  SettingsDataModelFieldCurrencyForm,
  type SettingsDataModelFieldCurrencyFormValues,
} from '@/settings/data-model/fields/forms/currency/components/SettingsDataModelFieldCurrencyForm';
import { SettingsDataModelFieldPreviewCard } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewCard';
import { FieldMetadataType } from 'twenty-shared/types';
import { type SettingsDataModelFieldEditFormValues } from '~/pages/settings/data-model/SettingsObjectFieldEdit';

type SettingsDataModelFieldCurrencySettingsFormCardProps = {
  disabled?: boolean;
  existingFieldMetadataId: string;
  objectNameSingular: string;
};

const StyledFieldPreviewCard = styled(SettingsDataModelFieldPreviewCard)`
  display: grid;
  flex: 1 1 100%;
`;

export const SettingsDataModelFieldCurrencySettingsFormCard = ({
  disabled,
  existingFieldMetadataId,
  objectNameSingular,
}: SettingsDataModelFieldCurrencySettingsFormCardProps) => {
  const { watch } = useFormContext<
    SettingsDataModelFieldCurrencyFormValues &
      SettingsDataModelFieldEditFormValues
  >();

  return (
    <SettingsDataModelPreviewFormCard
      preview={
        <StyledFieldPreviewCard
          fieldMetadataItem={{
            type: FieldMetadataType.CURRENCY,
            label: watch('label'),
            icon: watch('icon'),
            defaultValue: watch('defaultValue'),
            settings: watch('settings'),
          }}
          objectNameSingular={objectNameSingular}
        />
      }
      form={
        <SettingsDataModelFieldCurrencyForm
          disabled={disabled}
          existingFieldMetadataId={existingFieldMetadataId}
        />
      }
    />
  );
};
