import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { formatFieldMetadataItemAsFilterDefinition } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecoilValue } from 'recoil';

export const useFilterDefinitionsFromFilterableFieldMetadataItems = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const availableFieldMetadataItemsForFilter = useRecoilValue(
    availableFieldMetadataItemsForFilterFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  const filterDefinitions = availableFieldMetadataItemsForFilter.map(
    (fieldMetadataItem) =>
      formatFieldMetadataItemAsFilterDefinition({
        field: fieldMetadataItem,
      }),
  );

  return { filterDefinitions };
};
