import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { DateAggregateOperations } from '@/object-record/record-table/constants/DateAggregateOperations';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const FIELD_TYPES_AVAILABLE_FOR_NON_STANDARD_AGGREGATE_OPERATION = {
  [AggregateOperations.MIN]: [
    FieldMetadataType.NUMBER,
    FieldMetadataType.CURRENCY,
  ],
  [AggregateOperations.MAX]: [
    FieldMetadataType.NUMBER,
    FieldMetadataType.CURRENCY,
  ],
  [AggregateOperations.AVG]: [
    FieldMetadataType.NUMBER,
    FieldMetadataType.CURRENCY,
  ],
  [AggregateOperations.SUM]: [
    FieldMetadataType.NUMBER,
    FieldMetadataType.CURRENCY,
  ],
  [AggregateOperations.COUNT_FALSE]: [FieldMetadataType.BOOLEAN],
  [AggregateOperations.COUNT_TRUE]: [FieldMetadataType.BOOLEAN],
  [DateAggregateOperations.EARLIEST]: [
    FieldMetadataType.DATE_TIME,
    FieldMetadataType.DATE,
  ],
  [DateAggregateOperations.LATEST]: [
    FieldMetadataType.DATE_TIME,
    FieldMetadataType.DATE,
  ],
};
