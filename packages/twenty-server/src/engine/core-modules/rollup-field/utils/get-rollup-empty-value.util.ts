import {
  AggregateOperations,
  type FieldMetadataRollupSettings,
} from 'twenty-shared/types';

export const getRollupEmptyValue = ({
  aggregateOperation,
}: Pick<FieldMetadataRollupSettings, 'aggregateOperation'>): number | null =>
  aggregateOperation === AggregateOperations.COUNT ? 0 : null;
