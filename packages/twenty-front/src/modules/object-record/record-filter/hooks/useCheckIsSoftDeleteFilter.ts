import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { SOFT_DELETE_FILTER_FIELD_NAME } from '@/object-record/record-filter/constants/SoftDeleteFilterFieldName';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import isEmpty from 'lodash.isempty';
import { isDefined } from 'twenty-shared/utils';

export const useCheckIsSoftDeleteFilter = () => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const getRecordFieldMetadataItem = (recordFilter: RecordFilter) => {
    const allFieldMetadataItems = objectMetadataItems.flatMap(
      (objectMetadataItem) => objectMetadataItem.fields,
    );

    const foundFieldMetadataItem = allFieldMetadataItems.find(
      (fieldMetadataItem) =>
        fieldMetadataItem.id === recordFilter.fieldMetadataId,
    );

    if (!isDefined(foundFieldMetadataItem)) {
      throw new Error(
        `Field metadata item not found for field metadata id: ${recordFilter.fieldMetadataId}`,
      );
    }

    return foundFieldMetadataItem;
  };

  const checkHasAnySoftDeleteFilter = (recordFilter: RecordFilter) => {
    const foundFieldMetadataItem = getRecordFieldMetadataItem(recordFilter);

    const isNotEmptyFilter =
      (recordFilter.operand === RecordFilterOperand.Is &&
        !isEmpty(recordFilter.value)) ||
      recordFilter.operand === RecordFilterOperand.IsNotEmpty;

    return (
      foundFieldMetadataItem.name === SOFT_DELETE_FILTER_FIELD_NAME &&
      isNotEmptyFilter
    );
  };

  const checkIsAllSoftDeletedRecordsFilter = (recordFilter: RecordFilter) => {
    const foundFieldMetadataItem = getRecordFieldMetadataItem(recordFilter);

    const isNotEmptyFilter =
      recordFilter.operand === RecordFilterOperand.IsNotEmpty;

    return (
      foundFieldMetadataItem.name === SOFT_DELETE_FILTER_FIELD_NAME &&
      isNotEmptyFilter
    );
  };

  return { checkHasAnySoftDeleteFilter, checkIsAllSoftDeletedRecordsFilter };
};
