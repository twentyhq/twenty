import { z } from 'zod';
import { defineLogicFunction } from 'twenty-sdk/define';
import { type InputJsonSchema } from 'twenty-sdk/logic-function';
import { WHATSAPP_LOGIC_FUNCTION_GET_CONVERSATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { findPersonWhatsAppConversation } from 'src/logic-functions/data/find-person-whatsapp-conversation.util';
import { findLatestIncomingWhatsAppMessageTime } from 'src/logic-functions/data/find-latest-incoming-whatsapp-message-time.util';
import { isWithinWhatsAppCustomerServiceWindow } from 'src/logic-functions/data/is-within-whatsapp-customer-service-window.util';

const getConversationParamsSchema = z.object({
  personId: z.string().min(1),
  limit: z.number().int().min(1).max(100).default(30),
});

const GET_CONVERSATION_INPUT_SCHEMA: InputJsonSchema = {
  type: 'object',
  properties: {
    personId: { type: 'string', label: 'Person', description: 'ID of the person record in Twenty.' },
    limit: { type: 'number', label: 'Limit', description: 'How many of the latest messages to return, up to 100. Defaults to 30.' },
  },
  required: ['personId'],
  additionalProperties: false,
};

const handler = async (rawParams: unknown) => {
  const parsedParams = getConversationParamsSchema.safeParse(rawParams);

  if (!parsedParams.success) {
    throw new Error(z.prettifyError(parsedParams.error));
  }

  const messages = await findPersonWhatsAppConversation(parsedParams.data);

  return {
    messages,
    // tells the agent whether a free-form reply can still be delivered, or only a template
    isWithinCustomerServiceWindow: isWithinWhatsAppCustomerServiceWindow({
      lastCustomerMessageAt: findLatestIncomingWhatsAppMessageTime(messages),
    }),
  };
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_GET_CONVERSATION_UNIVERSAL_IDENTIFIER,
  name: 'get-whatsapp-conversation',
  description:
    'Read the latest WhatsApp messages exchanged with a person, oldest first, with their delivery status, and whether the 24 hour customer service window is still open.',
  timeoutSeconds: 30,
  handler,
  toolTriggerSettings: { inputSchema: GET_CONVERSATION_INPUT_SCHEMA },
});
