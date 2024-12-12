import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const FIELDS_AVAILABLE_BY_AGGREGATE_OPERATION = {
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
};
