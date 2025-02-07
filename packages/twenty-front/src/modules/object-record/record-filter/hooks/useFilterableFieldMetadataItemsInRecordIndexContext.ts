import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecoilValue } from 'recoil';

export const useFilterableFieldMetadataItemsInRecordIndexContext = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const filterableFieldMetadataItems = useRecoilValue(
    availableFieldMetadataItemsForFilterFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  return { filterableFieldMetadataItems };
};
