import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useCallback } from 'react';

export const useGetDefaultFieldMetadataItemForFilter = () => {
  const getDefaultFieldMetadataItemForFilter = useCallback(
    (objectMetadataItem: ObjectMetadataItem) => {
      const availableFieldMetadataItemsForFilter = jotaiStore.get(
        availableFieldMetadataItemsForFilterFamilySelector.selectorFamily({
          objectMetadataItemId: objectMetadataItem.id,
        }),
      );

      const fieldMetadataItemForLabelIdentifier =
        availableFieldMetadataItemsForFilter.find(
          (fieldMetadataItem) =>
            fieldMetadataItem.id ===
            objectMetadataItem?.labelIdentifierFieldMetadataId,
        );

      const firstFieldMetadataItem =
        availableFieldMetadataItemsForFilter?.[0] as
          | FieldMetadataItem
          | undefined;

      const defaultFieldMetadataItemForFilter =
        fieldMetadataItemForLabelIdentifier ?? firstFieldMetadataItem;

      return { defaultFieldMetadataItemForFilter };
    },
    [],
  );

  return {
    getDefaultFieldMetadataItemForFilter,
  };
};
