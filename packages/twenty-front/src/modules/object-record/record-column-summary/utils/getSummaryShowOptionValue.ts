import { type AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';

// The Show select holds one string per option, so a summary is keyed by its operation and field together
export const getSummaryShowOptionValue = ({
  aggregateOperation,
  relationTargetFieldMetadataId,
}: {
  aggregateOperation: AggregateOperations;
  relationTargetFieldMetadataId: string | null | undefined;
}) => `${aggregateOperation}:${relationTargetFieldMetadataId ?? ''}`;
