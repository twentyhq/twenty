import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { DATE_AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/DateAggregateOperations';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const FIELD_TYPES_AVAILABLE_FOR_NON_STANDARD_AGGREGATE_OPERATION = {
  [AGGREGATE_OPERATIONS.min]: [
    FieldMetadataType.Number,
    FieldMetadataType.Currency,
  ],
  [AGGREGATE_OPERATIONS.max]: [
    FieldMetadataType.Number,
    FieldMetadataType.Currency,
  ],
  [AGGREGATE_OPERATIONS.avg]: [
    FieldMetadataType.Number,
    FieldMetadataType.Currency,
  ],
  [AGGREGATE_OPERATIONS.sum]: [
    FieldMetadataType.Number,
    FieldMetadataType.Currency,
  ],
  [DATE_AGGREGATE_OPERATIONS.earliest]: [
    FieldMetadataType.DateTime,
    FieldMetadataType.Date,
  ],
  [DATE_AGGREGATE_OPERATIONS.latest]: [
    FieldMetadataType.DateTime,
    FieldMetadataType.Date,
  ],
};
