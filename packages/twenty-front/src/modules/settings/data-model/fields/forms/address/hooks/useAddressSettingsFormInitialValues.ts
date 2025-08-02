import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsDataModelFieldTextFormValues } from '@/settings/data-model/fields/forms/address/components/SettingsDataModelFieldAddressForm';
import { DEFAULT_SELECTION_ADDRESS_WITH_MESSAGES } from '@/settings/data-model/fields/forms/address/constants/DefaultSelectionAddressWithMessages';
import { useFormContext } from 'react-hook-form';

export const useAddressSettingsFormInitialValues = ({
  fieldMetadataItem,
}: {
  fieldMetadataItem?: Pick<FieldMetadataItem, 'settings'>;
}) => {
  const allAddressSubFields = DEFAULT_SELECTION_ADDRESS_WITH_MESSAGES.map(
    (selectionAddres) => selectionAddres.value,
  );
  const initialDisplaySubFields =
    fieldMetadataItem?.settings?.subFields &&
    fieldMetadataItem?.settings?.subFields?.length > 0
      ? fieldMetadataItem.settings.subFields
      : allAddressSubFields;

  const { resetField } = useFormContext<SettingsDataModelFieldTextFormValues>();

  const resetDefaultValueField = () => {
    resetField('settings.subFields', {
      defaultValue: allAddressSubFields,
    });
  };

  return {
    initialDisplaySubFields,
    resetDefaultValueField,
  };
};
