import {
  AggregateOperations,
  type FieldMetadataRollupSettings,
} from 'twenty-shared/types';

// A parent without matching children counts zero records and has no sum, average, min or max
export const getRollupEmptyValue = ({
  aggregateOperation,
}: Pick<FieldMetadataRollupSettings, 'aggregateOperation'>): number | null =>
  aggregateOperation === AggregateOperations.COUNT ? 0 : null;
