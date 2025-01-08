import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const FIELD_TYPES_AVAILABLE_FOR_NON_STANDARD_AGGREGATE_OPERATION = {
  [AGGREGATE_OPERATIONS.min]: [
    FieldMetadataType.Number,
    FieldMetadataType.Currency,
    FieldMetadataType.DateTime,
  ],
  [AGGREGATE_OPERATIONS.max]: [
    FieldMetadataType.Number,
    FieldMetadataType.Currency,
    FieldMetadataType.DateTime,
  ],
  [AGGREGATE_OPERATIONS.avg]: [
    FieldMetadataType.Number,
    FieldMetadataType.Currency,
  ],
  [AGGREGATE_OPERATIONS.sum]: [
    FieldMetadataType.Number,
    FieldMetadataType.Currency,
  ],
};
