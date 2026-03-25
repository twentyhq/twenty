import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { SOFT_DELETE_FILTER_FIELD_NAME } from '@/object-record/record-filter/constants/SoftDeleteFilterFieldName';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { getRecordFilterFieldMetadataItem } from '@/object-record/record-filter/utils/getRecordFilterFieldMetadataItem';
import { isRecordFilterAboutSoftDelete as isRecordFilterAboutSoftDeleteUtil } from '@/object-record/record-filter/utils/isRecordFilterAboutSoftDelete';

export const useCheckIsSoftDeleteFilter = () => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const isRecordFilterAboutSoftDelete = (recordFilter: RecordFilter) => {
    return isRecordFilterAboutSoftDeleteUtil({
      recordFilter,
      objectMetadataItems,
    });
  };

  const isSeeDeletedRecordsFilter = (recordFilter: RecordFilter) => {
    const foundFieldMetadataItem = getRecordFilterFieldMetadataItem({
      recordFilter,
      objectMetadataItems,
    });

    const isNotEmptyFilter =
      recordFilter.operand === RecordFilterOperand.IS_NOT_EMPTY;

    return (
      foundFieldMetadataItem.name === SOFT_DELETE_FILTER_FIELD_NAME &&
      isNotEmptyFilter
    );
  };

  return { isRecordFilterAboutSoftDelete, isSeeDeletedRecordsFilter };
};
