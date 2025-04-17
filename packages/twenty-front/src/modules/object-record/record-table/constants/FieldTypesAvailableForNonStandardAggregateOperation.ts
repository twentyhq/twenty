import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { DATE_AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/DateAggregateOperations';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const FIELD_TYPES_AVAILABLE_FOR_NON_STANDARD_AGGREGATE_OPERATION = {
  [AGGREGATE_OPERATIONS.min]: [
    FieldMetadataType.NUMBER,
    FieldMetadataType.CURRENCY,
  ],
  [AGGREGATE_OPERATIONS.max]: [
    FieldMetadataType.NUMBER,
    FieldMetadataType.CURRENCY,
  ],
  [AGGREGATE_OPERATIONS.avg]: [
    FieldMetadataType.NUMBER,
    FieldMetadataType.CURRENCY,
  ],
  [AGGREGATE_OPERATIONS.sum]: [
    FieldMetadataType.NUMBER,
    FieldMetadataType.CURRENCY,
  ],
  [AGGREGATE_OPERATIONS.countFalse]: [FieldMetadataType.BOOLEAN],
  [AGGREGATE_OPERATIONS.countTrue]: [FieldMetadataType.BOOLEAN],
  [DATE_AGGREGATE_OPERATIONS.earliest]: [
    FieldMetadataType.DATE_TIME,
    FieldMetadataType.DATE,
  ],
  [DATE_AGGREGATE_OPERATIONS.latest]: [
    FieldMetadataType.DATE_TIME,
    FieldMetadataType.DATE,
  ],
};
