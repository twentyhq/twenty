import { z } from 'zod';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { type InputJsonSchema } from 'twenty-sdk/logic-function';
import { WHATSAPP_LOGIC_FUNCTION_DELETE_TEMPLATE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { findWhatsAppTemplateOrThrow } from 'src/logic-functions/data/find-whatsapp-template-or-throw.util';
import { getWhatsAppAccessTokenOrThrow } from 'src/logic-functions/data/get-whatsapp-access-token-or-throw.util';
import { whatsAppApiRequest } from 'src/logic-functions/data/whatsapp-api-request.util';

const deleteTemplateParamsSchema = z.object({ templateId: z.string().min(1) });

const DELETE_TEMPLATE_INPUT_SCHEMA: InputJsonSchema = {
  type: 'object',
  properties: {
    templateId: { type: 'string', label: 'Template', description: 'ID of the WhatsApp template record in Twenty.' },
  },
  required: ['templateId'],
  additionalProperties: false,
};

const handler = async (rawParams: unknown) => {
  const parsedParams = deleteTemplateParamsSchema.safeParse(rawParams);

  if (!parsedParams.success) {
    throw new Error(z.prettifyError(parsedParams.error));
  }

  const template = await findWhatsAppTemplateOrThrow(parsedParams.data.templateId);

  // hsm_id limits the deletion to this language, name alone deletes every language of the template
  await whatsAppApiRequest({
    accessToken: await getWhatsAppAccessTokenOrThrow({
      whatsAppBusinessAccountId: template.whatsAppBusinessAccountId,
    }),
    endpoint: 'DELETE /{wabaId}/message_templates',
    pathParams: { wabaId: template.whatsAppBusinessAccountId },
    query: { name: template.name, hsm_id: template.metaTemplateId },
  });

  await new CoreApiClient().mutation({
    updateWhatsAppTemplate: {
      __args: { id: template.id, data: { status: 'DELETED' } },
      id: true,
    },
  });

  return { success: true };
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_DELETE_TEMPLATE_UNIVERSAL_IDENTIFIER,
  name: 'delete-template',
  description:
    'Delete one language version of a WhatsApp template in Meta. Its name cannot be reused for 30 days, and the Twenty record stays with status DELETED.',
  timeoutSeconds: 30,
  handler,
  toolTriggerSettings: { inputSchema: DELETE_TEMPLATE_INPUT_SCHEMA },
});
