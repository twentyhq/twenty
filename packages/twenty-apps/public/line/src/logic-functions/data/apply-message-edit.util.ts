import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { findMessageByExternalId } from 'src/logic-functions/data/find-message-by-external-id.util';
import { isMessageUnsent } from 'src/logic-functions/data/unsent-message-marker.util';

export const applyMessageEdit = async ({
  client,
  messageChannelId,
  messageId: externalId,
  text,
}: {
  client: CoreApiClient;
  messageChannelId: string;
  messageId: string;
  text: string;
}) => {
  if (await isMessageUnsent(messageChannelId, externalId)) {
    return;
  }

  const message = await findMessageByExternalId({
    client,
    messageChannelId,
    externalId,
  });

  if (!isDefined(message)) {
    console.warn(`Ignoring LINE edit, message ${externalId} was never imported`);

    return;
  }

  await client.mutation({
    updateMessage: {
      __args: { id: message.id, data: { text } },
      id: true,
    },
  });
};
