import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { findMessageByExternalId } from 'src/logic-functions/data/find-message-by-external-id.util';
import {
  forgetUnsentMessage,
  markMessageUnsent,
} from 'src/logic-functions/data/unsent-message-marker.util';

const UNSENT_MESSAGE_TEXT = '[Unsent on LINE]';

// LINE asks services to respect an unsend by deleting their copy, attachments included.
// The marker is set first, so an import still running when the unsend arrives applies it after ingesting.
export const applyUnsend = async ({
  client,
  messageChannelId,
  messageId: externalId,
}: {
  client: CoreApiClient;
  messageChannelId: string;
  messageId: string;
}) => {
  await markMessageUnsent(messageChannelId, externalId);

  const message = await findMessageByExternalId({
    client,
    messageChannelId,
    externalId,
  });

  if (!isDefined(message)) {
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

  await forgetUnsentMessage(messageChannelId, externalId);
};
