import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { getAdvancedFilterFieldMetadataItems } from '@/object-record/advanced-filter/utils/getAdvancedFilterFieldMetadataItems';
import { useFilterableFieldMetadataItems } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItems';
import { useContext } from 'react';

export const useAdvancedFilterFieldMetadataItems = () => {
  const { objectMetadataItem, shouldHideRelationFields } = useContext(
    AdvancedFilterContext,
  );
  const { filterableFieldMetadataItems } = useFilterableFieldMetadataItems(
    objectMetadataItem.id,
  );

  return {
    advancedFilterFieldMetadataItems: getAdvancedFilterFieldMetadataItems({
      filterableFieldMetadataItems,
      shouldHideRelationFields,
    }),
  };
};
