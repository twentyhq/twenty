import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { findMessageByExternalId } from 'src/logic-functions/data/find-message-by-external-id.util';

const UNSENT_MESSAGE_TEXT = '[Unsent on LINE]';

// LINE asks services to respect an unsend by deleting their copy, attachments included
export const applyUnsend = async ({
  client,
  messageChannelId,
  messageId: externalId,
}: {
  client: CoreApiClient;
  messageChannelId: string;
  messageId: string;
}) => {
  const message = await findMessageByExternalId({
    client,
    messageChannelId,
    externalId,
  });

  if (!isDefined(message)) {
    console.warn(
      `Ignoring LINE unsend, message ${externalId} was never imported`,
    );

    return;
  }

  await client.mutation({
    destroyAttachments: {
      __args: { filter: { targetMessageId: { eq: message.id } } },
      id: true,
    },
  });

  await client.mutation({
    updateMessage: {
      __args: { id: message.id, data: { text: UNSENT_MESSAGE_TEXT } },
      id: true,
    },
  });
};
