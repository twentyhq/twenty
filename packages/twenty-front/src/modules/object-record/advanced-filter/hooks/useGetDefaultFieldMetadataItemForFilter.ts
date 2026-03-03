import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useCallback } from 'react';
import { useStore } from 'jotai';

export const useGetDefaultFieldMetadataItemForFilter = () => {
  const store = useStore();
  const getDefaultFieldMetadataItemForFilter = useCallback(
    (objectMetadataItem: ObjectMetadataItem) => {
      const availableFieldMetadataItemsForFilter = store.get(
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
    [store],
  );

  return {
    getDefaultFieldMetadataItemForFilter,
  };
};
