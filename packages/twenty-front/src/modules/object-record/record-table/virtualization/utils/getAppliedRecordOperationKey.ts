export const getAppliedRecordOperationKey = ({
  operationType,
  recordId,
}: {
  operationType: 'create' | 'delete';
  recordId: string;
}): string => `${operationType}-${recordId}`;
