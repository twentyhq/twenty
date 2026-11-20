import { z } from 'zod';
import { defineLogicFunction } from 'twenty-sdk/define';
import { type InputJsonSchema } from 'twenty-sdk/logic-function';
import { WHATSAPP_LOGIC_FUNCTION_DELETE_TEMPLATE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { deleteWhatsAppTemplate } from 'src/logic-functions/data/delete-whatsapp-template.util';

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

  await deleteWhatsAppTemplate(parsedParams.data.templateId);

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
