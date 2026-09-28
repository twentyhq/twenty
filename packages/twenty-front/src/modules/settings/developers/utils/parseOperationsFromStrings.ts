import { type WebhookOperationType } from '~/pages/settings/developers/webhooks/types/WebhookOperationsType';

export const parseOperationsFromStrings = (
  operations: string[],
): WebhookOperationType[] => {
  return operations.map((op: string) => {
    const parts = op.split('.');
    const [firstPart = '', secondPart = '', thirdPart = ''] = parts;

    if (firstPart === 'metadata' && parts.length === 3) {
      return {
        object: `${firstPart}.${secondPart}`,
        action: thirdPart,
      };
    }

    return { object: firstPart, action: secondPart };
  });
};
