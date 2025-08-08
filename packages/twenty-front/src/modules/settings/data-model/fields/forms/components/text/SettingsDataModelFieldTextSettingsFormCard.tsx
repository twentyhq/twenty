import styled from '@emotion/styled';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';

import { SettingsDataModelFieldIsUniqueForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldIsUniqueForm';
import { SettingsDataModelFieldTextForm } from '@/settings/data-model/fields/forms/components/text/SettingsDataModelFieldTextForm';
import {
  SettingsDataModelFieldPreviewCard,
  SettingsDataModelFieldPreviewCardProps,
} from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewCard';
import { useFormContext } from 'react-hook-form';

type SettingsDataModelFieldTextSettingsFormCardProps = {
  disabled?: boolean;
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'icon' | 'label' | 'type' | 'defaultValue' | 'isUnique' | 'isCustom'
  >;
} & Pick<SettingsDataModelFieldPreviewCardProps, 'objectMetadataItem'>;

const StyledFieldPreviewCard = styled(SettingsDataModelFieldPreviewCard)`
  flex: 1 1 100%;
`;

export const SettingsDataModelFieldTextSettingsFormCard = ({
  disabled,
  fieldMetadataItem,
  objectMetadataItem,
}: SettingsDataModelFieldTextSettingsFormCardProps) => {
  const { watch } = useFormContext();

  return (
    <SettingsDataModelPreviewFormCard
      preview={
        <StyledFieldPreviewCard
          fieldMetadataItem={{
            ...fieldMetadataItem,
            settings: watch('settings'),
          }}
          objectMetadataItem={objectMetadataItem}
        />
      }
      form={
        <>
          <SettingsDataModelFieldTextForm
            disabled={disabled}
            fieldMetadataItem={fieldMetadataItem}
          />
          <SettingsDataModelFieldIsUniqueForm
            fieldMetadataItem={fieldMetadataItem}
          />
        </>
      }
    />
  );
};
