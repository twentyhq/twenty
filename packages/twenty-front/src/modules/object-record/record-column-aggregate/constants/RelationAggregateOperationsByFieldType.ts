import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { FieldMetadataType } from 'twenty-shared/types';

// Mirrors the operations the server accepts on a relation aggregate column
export const RELATION_AGGREGATE_OPERATIONS_BY_FIELD_TYPE: Partial<
  Record<FieldMetadataType, AggregateOperations[]>
> = {
  [FieldMetadataType.NUMBER]: [
    AggregateOperations.SUM,
    AggregateOperations.AVG,
    AggregateOperations.MIN,
    AggregateOperations.MAX,
  ],
  [FieldMetadataType.CURRENCY]: [
    AggregateOperations.SUM,
    AggregateOperations.AVG,
    AggregateOperations.MIN,
    AggregateOperations.MAX,
  ],
  [FieldMetadataType.RATING]: [
    AggregateOperations.AVG,
    AggregateOperations.MIN,
    AggregateOperations.MAX,
  ],
  [FieldMetadataType.DATE]: [AggregateOperations.MIN, AggregateOperations.MAX],
  [FieldMetadataType.DATE_TIME]: [
    AggregateOperations.MIN,
    AggregateOperations.MAX,
  ],
};
