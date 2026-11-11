import { isDefined } from 'twenty-shared/utils';

import { type WebhookOperationType } from '@/settings/developers/types/WebhookOperationsType';

export const getWebhookConditionObjectNameSingular = (
  operations: WebhookOperationType[],
): string | undefined => {
  const objectNames = new Set(
    operations.map(({ object }) => object).filter(isDefined),
  );
  const [objectName] = objectNames;

  if (
    objectNames.size !== 1 ||
    objectName === '*' ||
    objectName.startsWith('metadata.')
  ) {
    return undefined;
  }

  return objectName;
};
