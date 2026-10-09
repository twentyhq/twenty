import { WEBHOOK_EMPTY_OPERATION } from '@/settings/developers/constants/WebhookEmptyOperation';
import { type WebhookOperationType } from '@/settings/developers/types/WebhookOperationsType';

export const addEmptyOperationIfNecessary = (
  newOperations: WebhookOperationType[],
): WebhookOperationType[] => {
  const emptyOperationIndex = newOperations.findIndex(
    (op) => op.object === null,
  );
  const hasEmptyOperation = emptyOperationIndex !== -1;
  const nonEmptyOperations = newOperations.filter((op) => op.object !== null);
  const hasRecordCatchAll = nonEmptyOperations.some(
    (op) => op.object === '*' && op.action === '*',
  );
  const hasMetadataCatchAll = nonEmptyOperations.some(
    (op) => op.object === 'metadata.*' && op.action === '*',
  );

  if (hasRecordCatchAll && hasMetadataCatchAll) {
    return nonEmptyOperations;
  }

  if (hasEmptyOperation) {
    const emptyOperation = newOperations[emptyOperationIndex];
    return [...nonEmptyOperations, emptyOperation];
  }

  return [...nonEmptyOperations, WEBHOOK_EMPTY_OPERATION];
};
