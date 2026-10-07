import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';

// A slot holds one operand and one value, so only fields whose bucket is a single IS filter cross-filter: a
// date bucket is a range, and text or multi-select buckets would only reproduce as CONTAINS. The list is
// explicit rather than derived from each type's first operand, which would also admit ids and actor sub-fields.
export const isChartBucketFieldCrossFilterable = ({
  fieldMetadataItem,
  subFieldName,
}: {
  fieldMetadataItem: Pick<FieldMetadataItem, 'type'>;
  subFieldName?: string | null;
}): boolean => {
  switch (fieldMetadataItem.type) {
    case FieldMetadataType.SELECT:
    case FieldMetadataType.BOOLEAN:
    case FieldMetadataType.NUMBER:
    case FieldMetadataType.RATING:
    case FieldMetadataType.RELATION:
      return true;
    case FieldMetadataType.CURRENCY:
      return subFieldName === 'currencyCode';
    default:
      return false;
  }
};
