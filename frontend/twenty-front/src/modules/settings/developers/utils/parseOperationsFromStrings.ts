import { type WebhookOperationType } from '~/pages/settings/developers/webhooks/types/WebhookOperationsType';

export const parseOperationsFromStrings = (
  operations: string[],
): WebhookOperationType[] => {
  return operations.map((op: string) => {
    const parts = op.split('.');

    if (parts[0] === 'metadata' && parts.length === 3) {
      return {
        object: `${parts[0]}.${parts[1]}`,
        action: parts[2],
      };
    }

    const [object, action] = parts;

    return { object, action };
  });
};
