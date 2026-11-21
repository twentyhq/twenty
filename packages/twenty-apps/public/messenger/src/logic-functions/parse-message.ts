import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';

import { MESSENGER_LOGIC_FUNCTION_PARSE_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { applyMessageEdit } from 'src/logic-functions/data/apply-message-edit.util';
import { applyReferral } from 'src/logic-functions/data/apply-referral.util';
import { buildPostbackMessage } from 'src/logic-functions/data/build-postback-message.util';
import { findConnectedAccountIdByPageId } from 'src/logic-functions/data/find-connected-account-id-by-page-id.util';
import { findPageMessageChannelOrThrow } from 'src/logic-functions/data/find-page-message-channel-or-throw.util';
import { importMessage } from 'src/logic-functions/data/import-message.util';
import { resolveCustomerPersonId } from 'src/logic-functions/data/resolve-customer-person-id.util';
import { type ParseMessagePayload } from 'src/logic-functions/types/parse-message-payload.type';

const handler = async ({ pageId, event }: ParseMessagePayload) => {
  const connectedAccountId = await findConnectedAccountIdByPageId(pageId);

  if (!isDefined(connectedAccountId)) {
    console.warn(
      `Ignoring Messenger event, Page ${pageId} is no longer connected`,
    );

    return;
  }

  const client = new CoreApiClient();
  const messageChannel = await findPageMessageChannelOrThrow({
    connectedAccountId,
    pageId,
  });

  if (isDefined(event.message_edit)) {
    await applyMessageEdit({
      client,
      messageChannelId: messageChannel.id,
      messageEdit: event.message_edit,
    });

    return;
  }

  const pageScopedId =
    event.message?.is_echo === true ? event.recipient.id : event.sender.id;
  const personId = await resolveCustomerPersonId({
    client,
    connectedAccountId,
    pageId,
    pageScopedId,
  });
  const receivedAt = new Date(event.timestamp);

  const { postback } = event;
  const message = isDefined(postback)
    ? buildPostbackMessage({ ...event, postback })
    : event.message;

  if (isDefined(message)) {
    await importMessage({
      messageChannelId: messageChannel.id,
      pageHandle: messageChannel.handle,
      pageScopedId,
      personId,
      message,
      receivedAt,
    });
  }

  // an ad's first message or a Get Started tap carries its referral; later ones arrive as referral events
  const referral =
    event.message?.referral ?? postback?.referral ?? event.referral;

  if (isDefined(referral)) {
    await applyReferral({ client, personId, referral, referredAt: receivedAt });
  }
};

export default defineLogicFunction({
  universalIdentifier: MESSENGER_LOGIC_FUNCTION_PARSE_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'parse-message',
  description:
    'Processes one Messenger event: imports a message with its attachments or a button tap, applies an edit, or records the ad or link that brought the customer',
  timeoutSeconds: 60,
  handler,
});
