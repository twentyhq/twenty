import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SOFT_DELETE_FILTER_FIELD_NAME } from '@/object-record/record-filter/constants/SoftDeleteFilterFieldName';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { getRecordFilterFieldMetadataItem } from '@/object-record/record-filter/utils/getRecordFilterFieldMetadataItem';
import isEmpty from 'lodash.isempty';

export const isRecordFilterAboutSoftDelete = ({
  recordFilter,
  objectMetadataItems,
}: {
  recordFilter: RecordFilter;
  objectMetadataItems: ObjectMetadataItem[];
}) => {
  const foundFieldMetadataItem = getRecordFilterFieldMetadataItem({
    recordFilter,
    objectMetadataItems,
  });

  const valueIsNotEmptyFilter =
    (recordFilter.operand === RecordFilterOperand.Is &&
      !isEmpty(recordFilter.value)) ||
    recordFilter.operand === RecordFilterOperand.IsNotEmpty;

  return (
    foundFieldMetadataItem.name === SOFT_DELETE_FILTER_FIELD_NAME &&
    valueIsNotEmptyFilter
  );
};
