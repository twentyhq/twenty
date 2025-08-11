import { isDefined } from 'twenty-shared/utils';

import { type WebhookOperationType } from '~/pages/settings/developers/webhooks/types/WebhookOperationsType';

export const cleanAndFormatOperations = (
  operations: WebhookOperationType[],
) => {
  return Array.from(
    new Set(
      operations
        .filter((op) => isDefined(op.object) && isDefined(op.action))
        .map((op) => `${op.object}.${op.action}`),
    ),
  );
};
