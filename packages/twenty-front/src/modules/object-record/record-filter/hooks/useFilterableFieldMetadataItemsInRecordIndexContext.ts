import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { useFilterableFieldMetadataItems } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItems';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { shouldDisplayFormField } from '@/workflow/workflow-steps/workflow-actions/utils/shouldDisplayFormField';
import { useContext } from 'react';

export const useFilterableFieldMetadataItemsInRecordIndexContext = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { isWorkflowFindRecords } = useContext(AdvancedFilterContext);

  const {
    filterableFieldMetadataItems: filterableFieldMetadataItemsForRecordIndex,
  } = useFilterableFieldMetadataItems(objectMetadataItem.id);

  const filterableFieldMetadataItems = isWorkflowFindRecords
    ? filterableFieldMetadataItemsForRecordIndex.filter((fieldMetadataItem) =>
        shouldDisplayFormField({
          fieldMetadataItem,
          actionType: 'FIND_RECORDS',
        }),
      )
    : filterableFieldMetadataItemsForRecordIndex;

  return { filterableFieldMetadataItems };
};
