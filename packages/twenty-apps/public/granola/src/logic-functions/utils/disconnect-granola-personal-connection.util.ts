import { isNonEmptyString } from '@sniptt/guards';
import { type AppConnection, kv } from 'twenty-sdk/logic-function';

import { createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { getGranolaPersonalFolderSelectionKey } from 'src/logic-functions/utils/get-granola-personal-folder-selection-key.util';
import { removeGranolaPersonalWebhook } from 'src/logic-functions/utils/remove-granola-personal-webhook.util';

export const disconnectGranolaPersonalConnection = async ({
  connectionId,
  connection,
}: {
  connectionId: string;
  connection: Pick<AppConnection, 'accessToken'> | undefined;
}) => {
  await kv.delete(getGranolaPersonalFolderSelectionKey(connectionId));
  await removeGranolaPersonalWebhook({
    connectionId,
    client: isNonEmptyString(connection?.accessToken)
      ? createGranolaClientOrThrow({ apiKey: connection.accessToken })
      : undefined,
  });
};
