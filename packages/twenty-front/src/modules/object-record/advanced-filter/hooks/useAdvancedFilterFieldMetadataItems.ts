import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { useFilterableFieldMetadataItems } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItems';
import { useContext } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';

export const useAdvancedFilterFieldMetadataItems = () => {
  const { objectMetadataItem, shouldHideRelationFields } = useContext(
    AdvancedFilterContext,
  );
  const { filterableFieldMetadataItems } = useFilterableFieldMetadataItems(
    objectMetadataItem.id,
  );

  return {
    advancedFilterFieldMetadataItems: shouldHideRelationFields
      ? filterableFieldMetadataItems.filter(
          ({ type }) => type !== FieldMetadataType.RELATION,
        )
      : filterableFieldMetadataItems,
  };
};
