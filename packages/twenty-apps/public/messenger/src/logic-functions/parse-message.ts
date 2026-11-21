import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  ingestMessages,
  type IngestMessageParticipant,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { MESSENGER_LOGIC_FUNCTION_PARSE_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { findConnectedAccountIdByPageId } from 'src/logic-functions/data/find-connected-account-id-by-page-id.util';
import { fetchUserProfileName } from 'src/logic-functions/data/fetch-user-profile-name.util';
import { findOrCreateMessengerPersonId } from 'src/logic-functions/data/find-or-create-messenger-person-id.util';
import { getPageAccessTokenOrThrow } from 'src/logic-functions/data/get-page-access-token-or-throw.util';
import { findPageMessageChannelOrThrow } from 'src/logic-functions/data/find-page-message-channel-or-throw.util';
import { uploadIncomingAttachments } from 'src/logic-functions/data/upload-incoming-attachments.util';
import { type ParseMessagePayload } from 'src/logic-functions/types/parse-message-payload.type';

const handler = async ({ pageId, event }: ParseMessagePayload) => {
  const connectedAccountId = await findConnectedAccountIdByPageId(pageId);

  if (!isDefined(connectedAccountId)) {
    console.warn(`Ignoring Messenger message, Page ${pageId} is no longer connected`);

    return;
  }

  const { message } = event;
  // echoes are messages the Page sent, from Twenty or from Meta Business Suite
  const isSentByPage = message.is_echo === true;
  const pageScopedId = isSentByPage ? event.recipient.id : event.sender.id;

  const messageChannel = await findPageMessageChannelOrThrow({
    connectedAccountId,
    pageId,
  });
  const personId = await findOrCreateMessengerPersonId({
    client: new CoreApiClient(),
    pageId,
    pageScopedId,
    resolveName: async () =>
      fetchUserProfileName({
        pageAccessToken: await getPageAccessTokenOrThrow({
          connectedAccountId,
          pageId,
        }),
        pageScopedId,
      }),
  });

  // Twenty marks a message outgoing only when its sender handle is exactly the channel handle
  const pageParticipant = { handle: messageChannel.handle };
  const customerParticipant = { handle: pageScopedId, personId };
  const participants: IngestMessageParticipant[] = isSentByPage
    ? [
        { role: 'FROM', ...pageParticipant },
        { role: 'TO', ...customerParticipant },
      ]
    : [
        { role: 'FROM', ...customerParticipant },
        { role: 'TO', ...pageParticipant },
      ];

  // ingestion skips a mid it already holds, so retries and echoes of Twenty's own replies import once
  await ingestMessages({
    messageChannelId: messageChannel.id,
    messages: [
      {
        externalId: message.mid,
        threadExternalId: pageScopedId,
        text: message.text ?? '',
        receivedAt: new Date(event.timestamp),
        participants,
        attachments: await uploadIncomingAttachments(message),
      },
    ],
  });
};

export default defineLogicFunction({
  universalIdentifier: MESSENGER_LOGIC_FUNCTION_PARSE_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'parse-message',
  description:
    'Imports one Messenger message, with its attachments, into the conversation of its customer',
  timeoutSeconds: 60,
  handler,
});
