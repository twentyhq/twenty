import styled from '@emotion/styled';
import { useFormContext } from 'react-hook-form';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import {
  SettingsDataModelFieldBooleanForm,
  type SettingsDataModelFieldBooleanFormValues,
} from '@/settings/data-model/fields/forms/boolean/components/SettingsDataModelFieldBooleanForm';
import { useBooleanSettingsFormInitialValues } from '@/settings/data-model/fields/forms/boolean/hooks/useBooleanSettingsFormInitialValues';
import { SettingsDataModelFieldPreviewCard } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewCard';

type SettingsDataModelFieldBooleanSettingsFormCardProps = {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'name' | 'icon' | 'label' | 'type' | 'defaultValue'
  >;
  objectNameSingular: string;
};

const StyledFieldPreviewCard = styled(SettingsDataModelFieldPreviewCard)`
  display: grid;
  flex: 1 1 100%;
`;

export const SettingsDataModelFieldBooleanSettingsFormCard = ({
  fieldMetadataItem,
  objectNameSingular,
}: SettingsDataModelFieldBooleanSettingsFormCardProps) => {
  const { initialDefaultValue } = useBooleanSettingsFormInitialValues({
    fieldMetadataItem,
  });

  const { watch: watchFormValue } =
    useFormContext<SettingsDataModelFieldBooleanFormValues>();

  return (
    <SettingsDataModelPreviewFormCard
      preview={
        <StyledFieldPreviewCard
          fieldMetadataItem={{
            ...fieldMetadataItem,
            defaultValue: watchFormValue('defaultValue', initialDefaultValue),
          }}
          objectNameSingular={objectNameSingular}
        />
      }
      form={
        <SettingsDataModelFieldBooleanForm
          fieldMetadataItem={fieldMetadataItem}
        />
      }
    />
  );
};
