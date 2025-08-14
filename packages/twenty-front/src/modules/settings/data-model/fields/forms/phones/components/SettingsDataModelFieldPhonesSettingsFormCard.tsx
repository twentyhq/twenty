import styled from '@emotion/styled';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';

import { SettingsDataModelFieldIsUniqueForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldIsUniqueForm';
import { SettingsDataModelFieldPhonesForm } from '@/settings/data-model/fields/forms/phones/components/SettingsDataModelFieldPhonesForm';
import {
  SettingsDataModelFieldPreviewCard,
  type SettingsDataModelFieldPreviewCardProps,
} from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewCard';

type SettingsDataModelFieldPhonesSettingsFormCardProps = {
  disabled?: boolean;
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'icon' | 'label' | 'type' | 'isCustom' | 'settings'
  > &
    Partial<{ id: string }>;
} & Pick<SettingsDataModelFieldPreviewCardProps, 'objectMetadataItem'>;

const StyledFieldPreviewCard = styled(SettingsDataModelFieldPreviewCard)`
  flex: 1 1 100%;
`;

export const SettingsDataModelFieldPhonesSettingsFormCard = ({
  disabled,
  fieldMetadataItem,
  objectMetadataItem,
}: SettingsDataModelFieldPhonesSettingsFormCardProps) => {
  return (
    <SettingsDataModelPreviewFormCard
      preview={
        <StyledFieldPreviewCard
          fieldMetadataItem={fieldMetadataItem}
          objectMetadataItem={objectMetadataItem}
        />
      }
      form={
        <>
          <SettingsDataModelFieldPhonesForm
            disabled={disabled}
            fieldMetadataItem={fieldMetadataItem}
          />
          <SettingsDataModelFieldIsUniqueForm
            fieldMetadataItem={fieldMetadataItem}
            objectMetadataItem={objectMetadataItem}
          />
        </>
      }
    />
  );
};
