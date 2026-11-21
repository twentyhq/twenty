import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { findMessageByExternalId } from 'src/logic-functions/data/find-message-by-external-id.util';
import { type MessengerMessageEdit } from 'src/logic-functions/types/messenger-webhook.type';

export const applyMessageEdit = async ({
  client,
  messageChannelId,
  messageEdit,
}: {
  client: CoreApiClient;
  messageChannelId: string;
  messageEdit: MessengerMessageEdit;
}) => {
  const message = await findMessageByExternalId({
    client,
    messageChannelId,
    externalId: messageEdit.mid,
  });

  if (!isDefined(message)) {
    console.warn(
      `Ignoring Messenger edit, message ${messageEdit.mid} was never imported`,
    );

    return;
  }

  await client.mutation({
    updateMessage: {
      __args: { id: message.id, data: { text: messageEdit.text } },
      id: true,
    },
  });
};
