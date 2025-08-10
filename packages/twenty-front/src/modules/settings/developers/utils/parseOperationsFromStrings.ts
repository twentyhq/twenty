import { type WebhookOperationType } from '~/pages/settings/developers/webhooks/types/WebhookOperationsType';

export const parseOperationsFromStrings = (
  operations: string[],
): WebhookOperationType[] => {
  return operations.map((op: string) => {
    const [object, action] = op.split('.');
    return { object, action };
  });
};
