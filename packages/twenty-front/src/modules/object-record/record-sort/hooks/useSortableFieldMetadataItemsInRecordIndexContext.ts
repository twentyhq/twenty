import { availableFieldMetadataItemsForSortFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForSortFamilySelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecoilValue } from 'recoil';

export const useSortableFieldMetadataItemsInRecordIndexContext = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const sortableFieldMetadataItems = useRecoilValue(
    availableFieldMetadataItemsForSortFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  return { sortableFieldMetadataItems };
};
