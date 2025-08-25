import styled from '@emotion/styled';
import { useFormContext } from 'react-hook-form';
import { type z } from 'zod';

import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import {
  type settingsDataModelFieldMultiSelectFormSchema,
  SettingsDataModelFieldSelectForm,
  type settingsDataModelFieldSelectFormSchema,
} from '@/settings/data-model/fields/forms/select/components/SettingsDataModelFieldSelectForm';
import { SettingsDataModelFieldPreviewCard } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewCard';
import { type FieldMetadataType } from 'twenty-shared/types';
import { type SettingsDataModelFieldEditFormValues } from '~/pages/settings/data-model/SettingsObjectFieldEdit';

type SettingsDataModelFieldSelectOrMultiSelectFormValues = z.infer<
  | typeof settingsDataModelFieldSelectFormSchema
  | typeof settingsDataModelFieldMultiSelectFormSchema
>;

type SettingsDataModelFieldSelectSettingsFormCardProps = {
  objectNameSingular: string;
  fieldType: FieldMetadataType.SELECT | FieldMetadataType.MULTI_SELECT;
  existingFieldMetadataId: string;
};

const StyledSettingsDataModelFieldPreviewCard = styled(
  SettingsDataModelFieldPreviewCard,
)`
  display: grid;
  flex: 1 1 100%;
`;

export const SettingsDataModelFieldSelectSettingsFormCard = ({
  objectNameSingular,
  fieldType,
  existingFieldMetadataId,
}: SettingsDataModelFieldSelectSettingsFormCardProps) => {
  const { watch: watchFormValue } = useFormContext<
    SettingsDataModelFieldSelectOrMultiSelectFormValues &
      SettingsDataModelFieldEditFormValues
  >();

  return (
    <SettingsDataModelPreviewFormCard
      preview={
        <StyledSettingsDataModelFieldPreviewCard
          fieldMetadataItem={{
            type: fieldType,
            label: watchFormValue('label'),
            icon: watchFormValue('icon'),
            defaultValue: watchFormValue('defaultValue'),
            options: watchFormValue('options'),
          }}
          objectNameSingular={objectNameSingular}
        />
      }
      form={
        <>
          <SettingsDataModelFieldSelectForm
            fieldType={fieldType}
            existingFieldMetadataId={existingFieldMetadataId}
          />
        </>
      }
    />
  );
};
