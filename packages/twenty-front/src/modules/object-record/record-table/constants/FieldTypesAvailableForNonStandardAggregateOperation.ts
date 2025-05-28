import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { DATE_AggregateOperations } from '@/object-record/record-table/constants/DateAggregateOperations';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const FIELD_TYPES_AVAILABLE_FOR_NON_STANDARD_AGGREGATE_OPERATION = {
  [AggregateOperations.min]: [
    FieldMetadataType.NUMBER,
    FieldMetadataType.CURRENCY,
  ],
  [AggregateOperations.max]: [
    FieldMetadataType.NUMBER,
    FieldMetadataType.CURRENCY,
  ],
  [AggregateOperations.avg]: [
    FieldMetadataType.NUMBER,
    FieldMetadataType.CURRENCY,
  ],
  [AggregateOperations.sum]: [
    FieldMetadataType.NUMBER,
    FieldMetadataType.CURRENCY,
  ],
  [AggregateOperations.countFalse]: [FieldMetadataType.BOOLEAN],
  [AggregateOperations.countTrue]: [FieldMetadataType.BOOLEAN],
  [DATE_AggregateOperations.earliest]: [
    FieldMetadataType.DATE_TIME,
    FieldMetadataType.DATE,
  ],
  [DATE_AggregateOperations.latest]: [
    FieldMetadataType.DATE_TIME,
    FieldMetadataType.DATE,
  ],
};
