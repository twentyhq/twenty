import styled from '@emotion/styled';
import { useFormContext } from 'react-hook-form';
import { type z } from 'zod';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import {
  type settingsDataModelFieldMultiSelectFormSchema,
  SettingsDataModelFieldSelectForm,
  type settingsDataModelFieldSelectFormSchema,
} from '@/settings/data-model/fields/forms/select/components/SettingsDataModelFieldSelectForm';
import { useSelectSettingsFormInitialValues } from '@/settings/data-model/fields/forms/select/hooks/useSelectSettingsFormInitialValues';
import {
  SettingsDataModelFieldPreviewCard,
  type SettingsDataModelFieldPreviewCardProps,
} from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewCard';

type SettingsDataModelFieldSelectOrMultiSelectFormValues = z.infer<
  | typeof settingsDataModelFieldSelectFormSchema
  | typeof settingsDataModelFieldMultiSelectFormSchema
>;

type SettingsDataModelFieldSelectSettingsFormCardProps = {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    | 'icon'
    | 'label'
    | 'type'
    | 'defaultValue'
    | 'options'
    | 'isUnique'
    | 'isCustom'
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
        <>
          <SettingsDataModelFieldSelectForm
            fieldMetadataItem={fieldMetadataItem}
          />
        </>
      }
    />
  );
};
