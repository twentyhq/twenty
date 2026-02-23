import { flattenedReadableFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedReadableFieldMetadataItemIdsSelector';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export const useFilterVisibleAndReadableRecordField = () => {
  const flattenedReadableFieldMetadataItems = useRecoilValueV2(
    flattenedReadableFieldMetadataItemsSelector,
  );

  const filterVisibleAndReadableRecordField = (
    recordFieldToFilter: RecordField,
  ) => {
    return (
      recordFieldToFilter.isVisible === true &&
      flattenedReadableFieldMetadataItems.some(
        (fieldMetadataItemToFilter) =>
          fieldMetadataItemToFilter.id ===
            recordFieldToFilter.fieldMetadataItemId &&
          fieldMetadataItemToFilter.isActive === true &&
          !isHiddenSystemField(fieldMetadataItemToFilter),
      )
    );
  };

  return { filterVisibleAndReadableRecordField };
};
