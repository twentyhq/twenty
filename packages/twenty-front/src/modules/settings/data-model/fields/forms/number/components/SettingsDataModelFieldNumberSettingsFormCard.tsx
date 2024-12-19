import styled from '@emotion/styled';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import { SettingsDataModelFieldNumberForm } from '@/settings/data-model/fields/forms/number/components/SettingsDataModelFieldNumberForm';
import {
  SettingsDataModelFieldPreviewCard,
  SettingsDataModelFieldPreviewCardProps,
} from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewCard';
import { useFormContext } from 'react-hook-form';

type SettingsDataModelFieldNumberSettingsFormCardProps = {
  disabled?: boolean;
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'icon' | 'label' | 'type' | 'defaultValue' | 'settings'
  >;
} & Pick<SettingsDataModelFieldPreviewCardProps, 'objectMetadataItem'>;

const StyledFieldPreviewCard = styled(SettingsDataModelFieldPreviewCard)`
  display: grid;
  flex: 1 1 100%;
`;

export const SettingsDataModelFieldNumberSettingsFormCard = ({
  disabled,
  fieldMetadataItem,
  objectMetadataItem,
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
            type: fieldMetadataItem.type,
          }}
          objectMetadataItem={objectMetadataItem}
        />
      }
      form={
        <SettingsDataModelFieldNumberForm
          disabled={disabled}
          fieldMetadataItem={fieldMetadataItem}
        />
      }
    />
  );
};
