import { flattenedReadableFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedReadableFieldMetadataItemIdsSelector';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useRecoilValue } from 'recoil';

export const useFilterVisibleAndReadableRecordField = () => {
  const flattenedReadableFieldMetadataItems = useRecoilValue(
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
          fieldMetadataItemToFilter.isSystem !== true,
      )
    );
  };

  return { filterVisibleAndReadableRecordField };
};
