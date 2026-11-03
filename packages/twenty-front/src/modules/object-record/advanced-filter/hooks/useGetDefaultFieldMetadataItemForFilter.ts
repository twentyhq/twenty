import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { useCallback, useContext } from 'react';
import { useStore } from 'jotai';

export const useGetDefaultFieldMetadataItemForFilter = () => {
  const store = useStore();
  const { fieldSelectLeadingSections } = useContext(AdvancedFilterContext);
  const getDefaultFieldMetadataItemForFilter = useCallback(
    (objectMetadataItem: EnrichedObjectMetadataItem | undefined) => {
      const availableFieldMetadataItemsForFilter = store.get(
        availableFieldMetadataItemsForFilterFamilySelector.selectorFamily({
          objectMetadataItemId: objectMetadataItem?.id ?? '',
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
        fieldSelectLeadingSections?.[0]?.fieldMetadataItems[0] ??
        fieldMetadataItemForLabelIdentifier ??
        firstFieldMetadataItem;

      return { defaultFieldMetadataItemForFilter };
    },
    [store, fieldSelectLeadingSections],
  );

  return {
    getDefaultFieldMetadataItemForFilter,
  };
};
