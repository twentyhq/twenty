import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getDefaultFieldMetadataItemForFilter } from '@/object-record/advanced-filter/utils/getDefaultFieldMetadataItemForFilter';
import { useCallback } from 'react';
import { useStore } from 'jotai';

export const useGetDefaultFieldMetadataItemForFilter = () => {
  const store = useStore();
  const getDefaultFieldMetadataItemOfObject = useCallback(
    (objectMetadataItem: EnrichedObjectMetadataItem) => ({
      defaultFieldMetadataItemForFilter: getDefaultFieldMetadataItemForFilter({
        objectMetadataItem,
        filterableFieldMetadataItems: store.get(
          availableFieldMetadataItemsForFilterFamilySelector.selectorFamily({
            objectMetadataItemId: objectMetadataItem.id,
          }),
        ),
      }),
    }),
    [store],
  );

  return {
    getDefaultFieldMetadataItemForFilter: getDefaultFieldMetadataItemOfObject,
  };
};
