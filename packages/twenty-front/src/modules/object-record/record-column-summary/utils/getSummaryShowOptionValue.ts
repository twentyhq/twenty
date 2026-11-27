import { type AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';

export const getSummaryShowOptionValue = ({
  aggregateOperation,
  relationTargetFieldMetadataId,
}: {
  aggregateOperation: AggregateOperations;
  relationTargetFieldMetadataId: string | null | undefined;
}) => `${aggregateOperation}:${relationTargetFieldMetadataId ?? ''}`;
