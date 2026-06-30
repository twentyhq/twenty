import { useFilterableFieldMetadataItems } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItems';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';

export const useFilterableFieldMetadataItemsInRecordIndexContext = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const { filterableFieldMetadataItems } = useFilterableFieldMetadataItems(
    objectMetadataItem.id,
  );

  return { filterableFieldMetadataItems };
};
