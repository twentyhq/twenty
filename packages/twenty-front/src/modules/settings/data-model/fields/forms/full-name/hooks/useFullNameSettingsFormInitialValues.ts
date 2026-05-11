import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { getDefaultSortSubFieldForFullName } from '@/object-metadata/utils/getDefaultSortSubFieldForFullName';

type UseFullNameSettingsFormInitialValuesProps = {
  existingFieldMetadataId: string;
};

export const useFullNameSettingsFormInitialValues = ({
  existingFieldMetadataId,
}: UseFullNameSettingsFormInitialValuesProps) => {
  const { fieldMetadataItem } = useFieldMetadataItemById(
    existingFieldMetadataId,
  );

  const initialDefaultSortSubField = getDefaultSortSubFieldForFullName(
    fieldMetadataItem?.settings,
  );

  return {
    initialDefaultSortSubField,
  };
};
