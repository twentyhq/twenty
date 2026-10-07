import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { ViewFilterOperand } from 'twenty-shared/types';
import {
  getFilterTypeFromFieldType,
  isFieldMetadataDateKind,
} from 'twenty-shared/utils';

// A slot holds one operand and one value. A date bucket is a range (two filters), and a field whose bucket
// filter is CONTAINS (text, multi-select) would widen the bucket instead of reproducing it, so only fields whose
// bucket reduces to a single IS filter cross-filter; the other buckets keep the drilldown navigation.
export const isChartBucketFieldCrossFilterable = ({
  fieldMetadataItem,
  subFieldName,
}: {
  fieldMetadataItem: Pick<FieldMetadataItem, 'type'>;
  subFieldName?: string | null;
}): boolean => {
  if (isFieldMetadataDateKind(fieldMetadataItem.type)) {
    return false;
  }

  if (isFieldRelation(fieldMetadataItem)) {
    return true;
  }

  const [bucketOperand] = getRecordFilterOperands({
    filterType: getFilterTypeFromFieldType(fieldMetadataItem.type),
    subFieldName,
  });

  return bucketOperand === ViewFilterOperand.IS;
};
