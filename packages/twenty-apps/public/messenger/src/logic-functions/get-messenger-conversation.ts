import { defineLogicFunction } from 'twenty-sdk/define';
import { type InputJsonSchema } from 'twenty-sdk/logic-function';
import { z } from 'zod';

import { MESSENGER_LOGIC_FUNCTION_GET_CONVERSATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { findPersonMessengerConversation } from 'src/logic-functions/data/find-person-messenger-conversation.util';
import { getReplyWindow } from 'src/logic-functions/data/get-reply-window.util';

const getConversationParamsSchema = z.object({
  personId: z.string().min(1),
  limit: z.number().int().min(1).max(100).default(30),
});

const GET_CONVERSATION_INPUT_SCHEMA: InputJsonSchema = {
  type: 'object',
  properties: {
    personId: {
      type: 'string',
      label: 'Person',
      description: 'ID of the person record in Twenty.',
    },
    limit: {
      type: 'number',
      label: 'Limit',
      description:
        'How many of the latest messages to return, up to 100. Defaults to 30.',
    },
  },
  required: ['personId'],
  additionalProperties: false,
};

const handler = async (rawParams: unknown) => {
  const parsedParams = getConversationParamsSchema.safeParse(rawParams);

  if (!parsedParams.success) {
    throw new Error(z.prettifyError(parsedParams.error));
  }

  const { messages } = await findPersonMessengerConversation(parsedParams.data);

  return { messages, replyWindow: getReplyWindow(messages) };
};

export default defineLogicFunction({
  universalIdentifier:
    MESSENGER_LOGIC_FUNCTION_GET_CONVERSATION_UNIVERSAL_IDENTIFIER,
  name: 'get-messenger-conversation',
  description:
    'Read the latest Messenger messages exchanged with a person, oldest first, with their delivery status, and the reply window: OPEN (the assistant may send), HUMAN_ONLY (only a person can reply, from the conversation in Twenty) or CLOSED.',
  timeoutSeconds: 30,
  handler,
  toolTriggerSettings: { inputSchema: GET_CONVERSATION_INPUT_SCHEMA },
});
