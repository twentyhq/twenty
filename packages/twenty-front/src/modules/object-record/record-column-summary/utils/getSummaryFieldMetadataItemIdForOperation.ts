import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';

// Keeps the chosen field while it supports the operation, so switching between sum and average keeps it
export const getSummaryFieldMetadataItemIdForOperation = ({
  aggregateOperation,
  relationTargetFieldMetadataId,
  summaryFieldMetadataItems,
}: {
  aggregateOperation: AggregateOperations;
  relationTargetFieldMetadataId: string | null;
  summaryFieldMetadataItems: Pick<FieldMetadataItem, 'id'>[];
}): string | null => {
  if (aggregateOperation === AggregateOperations.COUNT) {
    return null;
  }

  const isSupported = summaryFieldMetadataItems.some(
    ({ id }) => id === relationTargetFieldMetadataId,
  );

  return isSupported
    ? relationTargetFieldMetadataId
    : (summaryFieldMetadataItems[0]?.id ?? null);
};
