import { isDefined } from 'twenty-shared/utils';

import { type WebhookOperationType } from '~/pages/settings/developers/webhooks/types/WebhookOperationsType';

export const parseOperationsFromStrings = (
  operations: string[],
): WebhookOperationType[] => {
  return operations.flatMap((op: string): WebhookOperationType[] => {
    const parts = op.split('.');
    const [firstPart, secondPart, thirdPart] = parts;

    if (!isDefined(firstPart) || !isDefined(secondPart)) {
      return [];
    }

    if (
      firstPart === 'metadata' &&
      parts.length === 3 &&
      isDefined(thirdPart)
    ) {
      return [{ object: `${firstPart}.${secondPart}`, action: thirdPart }];
    }

    return [{ object: firstPart, action: secondPart }];
  });
};
