import styled from '@emotion/styled';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import {
  SettingsDataModelFieldAddressForm,
  SettingsDataModelFieldTextFormValues,
} from '@/settings/data-model/fields/forms/address/components/SettingsDataModelFieldAddressForm';
import { useAddressSettingsFormInitialValues } from '@/settings/data-model/fields/forms/address/hooks/useAddressSettingsFormInitialValues';
import {
  SettingsDataModelFieldPreviewCard,
  SettingsDataModelFieldPreviewCardProps,
} from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewCard';
import { useFormContext } from 'react-hook-form';

type SettingsDataModelFieldAddressSettingsFormCardProps = {
  disabled?: boolean;
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'icon' | 'label' | 'type' | 'defaultValue' | 'settings'
  >;
} & Pick<SettingsDataModelFieldPreviewCardProps, 'objectMetadataItem'>;

const StyledFieldPreviewCard = styled(SettingsDataModelFieldPreviewCard)`
  flex: 1 1 100%;
`;

export const SettingsDataModelFieldAddressSettingsFormCard = ({
  disabled,
  fieldMetadataItem,
  objectMetadataItem,
}: SettingsDataModelFieldAddressSettingsFormCardProps) => {
  const { initialDisplaySubFields } = useAddressSettingsFormInitialValues({
    fieldMetadataItem,
  });
  const { watch: watchFormValue } =
    useFormContext<SettingsDataModelFieldTextFormValues>();
  return (
    <SettingsDataModelPreviewFormCard
      preview={
        <StyledFieldPreviewCard
          fieldMetadataItem={{
            ...fieldMetadataItem,
            settings: {
              ...fieldMetadataItem.settings,
              subFields: watchFormValue(
                'settings.subFields',
                initialDisplaySubFields,
              ),
            },
          }}
          objectMetadataItem={objectMetadataItem}
        />
      }
      form={
        <SettingsDataModelFieldAddressForm
          disabled={disabled}
          fieldMetadataItem={fieldMetadataItem}
        />
      }
    />
  );
};
