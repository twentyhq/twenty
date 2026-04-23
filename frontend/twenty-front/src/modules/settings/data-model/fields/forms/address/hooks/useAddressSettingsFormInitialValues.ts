import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { type SettingsDataModelFieldTextFormValues } from '@/settings/data-model/fields/forms/address/components/SettingsDataModelFieldAddressForm';
import { DEFAULT_SELECTION_ADDRESS_WITH_MESSAGES } from '@/settings/data-model/fields/forms/address/constants/DefaultSelectionAddressWithMessages';
import { useFormContext } from 'react-hook-form';

type UseAddressSettingsFormInitialValuesProps = {
  existingFieldMetadataId: string;
};

export const useAddressSettingsFormInitialValues = ({
  existingFieldMetadataId,
}: UseAddressSettingsFormInitialValuesProps) => {
  const { fieldMetadataItem } = useFieldMetadataItemById(
    existingFieldMetadataId,
  );

  const allAddressSubFields = DEFAULT_SELECTION_ADDRESS_WITH_MESSAGES.map(
    (selectionAddres) => selectionAddres.value,
  );
  const initialDisplaySubFields =
    fieldMetadataItem?.settings?.subFields &&
    fieldMetadataItem?.settings?.subFields?.length > 0
      ? fieldMetadataItem.settings.subFields
      : allAddressSubFields;

  const defaultDefaultValue = {
    addressStreet1: "''",
    addressStreet2: null,
    addressCity: null,
    addressState: null,
    addressPostcode: null,
    addressCountry: null,
    addressLat: null,
    addressLng: null,
  };
  const initialDefaultValue =
    fieldMetadataItem?.defaultValue ?? defaultDefaultValue;

  const { resetField } = useFormContext<SettingsDataModelFieldTextFormValues>();

  const resetDefaultValueField = () => {
    resetField('settings.subFields', {
      defaultValue: allAddressSubFields,
    });
  };

  return {
    initialDefaultValue,
    initialDisplaySubFields,
    resetDefaultValueField,
  };
};
