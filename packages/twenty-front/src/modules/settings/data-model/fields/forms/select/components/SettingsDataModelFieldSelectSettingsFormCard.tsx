import { useFormContext } from 'react-hook-form';
import styled from '@emotion/styled';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import {
  settingsDataModelFieldMultiSelectFormSchema,
  SettingsDataModelFieldSelectForm,
  settingsDataModelFieldSelectFormSchema,
} from '@/settings/data-model/fields/forms/select/components/SettingsDataModelFieldSelectForm';
import { useSelectSettingsFormInitialValues } from '@/settings/data-model/fields/forms/select/hooks/useSelectSettingsFormInitialValues';
import {
  SettingsDataModelFieldPreviewCard,
  SettingsDataModelFieldPreviewCardProps,
} from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewCard';

const selectOrMultiSelectFormSchema = z.union([
  settingsDataModelFieldSelectFormSchema,
  settingsDataModelFieldMultiSelectFormSchema,
]);

type SettingsDataModelFieldSelectOrMultiSelectFormValues = z.infer<
  typeof selectOrMultiSelectFormSchema
>;

type SettingsDataModelFieldSelectSettingsFormCardProps = {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'icon' | 'label' | 'type' | 'defaultValue' | 'options'
  >;
} & Pick<SettingsDataModelFieldPreviewCardProps, 'objectMetadataItem'>;

const StyledFieldPreviewCard = styled(SettingsDataModelFieldPreviewCard)`
  display: grid;
  flex: 1 1 100%;
`;

export const SettingsDataModelFieldSelectSettingsFormCard = ({
  fieldMetadataItem,
  objectMetadataItem,
}: SettingsDataModelFieldSelectSettingsFormCardProps) => {
  const { initialOptions, initialDefaultValue } =
    useSelectSettingsFormInitialValues({
      fieldMetadataItem,
    });

  const { watch: watchFormValue } =
    useFormContext<SettingsDataModelFieldSelectOrMultiSelectFormValues>();

  return (
    <SettingsDataModelPreviewFormCard
      preview={
        <StyledFieldPreviewCard
          fieldMetadataItem={{
            ...fieldMetadataItem,
            defaultValue: watchFormValue('defaultValue', initialDefaultValue),
            options: watchFormValue('options', initialOptions),
          }}
          objectMetadataItem={objectMetadataItem}
        />
      }
      form={
        <SettingsDataModelFieldSelectForm
          fieldMetadataItem={fieldMetadataItem}
        />
      }
    />
  );
};
