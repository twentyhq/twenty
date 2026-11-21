import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { type InputJsonSchema } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';
import { z } from 'zod';

import { MESSENGER_LOGIC_FUNCTION_SEND_REPLY_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { findPersonMessengerConversation } from 'src/logic-functions/data/find-person-messenger-conversation.util';
import { importMessage } from 'src/logic-functions/data/import-message.util';
import { resolveCustomerPersonId } from 'src/logic-functions/data/resolve-customer-person-id.util';
import { sendMessengerReply } from 'src/logic-functions/data/send-messenger-reply.util';

const sendReplyParamsSchema = z.object({
  personId: z.string().min(1),
  text: z.string().trim().min(1).max(2000),
});

const SEND_REPLY_INPUT_SCHEMA: InputJsonSchema = {
  type: 'object',
  properties: {
    personId: {
      type: 'string',
      label: 'Person',
      description: 'ID of the person record in Twenty.',
    },
    text: {
      type: 'string',
      label: 'Text',
      description: 'The reply, as the member approved it.',
    },
  },
  required: ['personId', 'text'],
  additionalProperties: false,
};

const handler = async (rawParams: unknown) => {
  const parsedParams = sendReplyParamsSchema.safeParse(rawParams);

  if (!parsedParams.success) {
    throw new Error(z.prettifyError(parsedParams.error));
  }

  const { personId, text } = parsedParams.data;
  const { latestThread } = await findPersonMessengerConversation({
    personId,
    limit: 1,
  });

  if (!isDefined(latestThread)) {
    throw new Error('This person has no Messenger conversation.');
  }

  const { externalId } = await sendMessengerReply({
    ...latestThread,
    text,
    attachments: [],
    isHumanAgentTagAllowed: false,
  });

  // the echo webhook would import it too; importing now shows it at once, and the echo is skipped as a duplicate
  await importMessage({
    messageChannelId: latestThread.messageChannelId,
    pageHandle: latestThread.pageHandle,
    pageScopedId: latestThread.threadExternalId,
    personId: await resolveCustomerPersonId({
      client: new CoreApiClient(),
      connectedAccountId: latestThread.connectedAccountId,
      pageId: latestThread.pageHandle,
      pageScopedId: latestThread.threadExternalId,
    }),
    message: { mid: externalId, text, is_echo: true },
    receivedAt: new Date(),
  });

  return { sent: true, messageId: externalId };
};

export default defineLogicFunction({
  universalIdentifier: MESSENGER_LOGIC_FUNCTION_SEND_REPLY_UNIVERSAL_IDENTIFIER,
  name: 'send-messenger-reply',
  description:
    "Send a text reply to a person's latest Messenger conversation. Only works within 24 hours of the customer's last message; call it only after the member confirmed the exact text.",
  timeoutSeconds: 30,
  handler,
  toolTriggerSettings: { inputSchema: SEND_REPLY_INPUT_SCHEMA },
});
