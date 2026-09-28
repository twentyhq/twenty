import { WEBHOOK_EMPTY_OPERATION } from '~/pages/settings/developers/webhooks/constants/WebhookEmptyOperation';
import { type WebhookOperationType } from '~/pages/settings/developers/webhooks/types/WebhookOperationsType';
import { isDefined } from 'twenty-shared/utils';

export const addEmptyOperationIfNecessary = (
  newOperations: WebhookOperationType[],
): WebhookOperationType[] => {
  const emptyOperation = newOperations.find((op) => op.object === null);
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

  if (isDefined(emptyOperation)) {
    return [...nonEmptyOperations, emptyOperation];
  }

  return [...nonEmptyOperations, WEBHOOK_EMPTY_OPERATION];
};
