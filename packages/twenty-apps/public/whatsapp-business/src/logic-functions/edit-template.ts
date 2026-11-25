import { z } from 'zod';
import { defineLogicFunction } from 'twenty-sdk/define';
import { type InputJsonSchema } from 'twenty-sdk/logic-function';
import { WHATSAPP_LOGIC_FUNCTION_EDIT_TEMPLATE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { editWhatsAppTemplate } from 'src/logic-functions/data/edit-whatsapp-template.util';
import { editTemplateParamsSchema } from 'src/logic-functions/data/edit-template-params.schema';

const EDIT_TEMPLATE_INPUT_SCHEMA: InputJsonSchema = {
  type: 'object',
  properties: {
    templateId: { type: 'string', label: 'Template', description: 'ID of the WhatsApp template record in Twenty.' },
    category: { type: 'string', label: 'Category', description: 'New category: UTILITY, MARKETING or AUTHENTICATION.' },
    header: { type: 'string', label: 'Header', description: 'New text header. Leave out to remove it.' },
    body: {
      type: 'string',
      label: 'Body',
      description: 'New message text. Replaces the whole content: header and footer are kept only when passed again.',
    },
    footer: { type: 'string', label: 'Footer', description: 'New footer. Leave out to remove it.' },
    bodyExamples: {
      type: 'array',
      label: 'Body examples',
      description: 'One example value per body parameter, with its name for named templates.',
      items: {
        type: 'object',
        properties: { name: { type: 'string' }, example: { type: 'string' } },
        required: ['example'],
      },
    },
  },
  required: ['templateId'],
  additionalProperties: false,
};

const handler = async (rawParams: unknown) => {
  const parsedParams = editTemplateParamsSchema.safeParse(rawParams);

  if (!parsedParams.success) {
    throw new Error(z.prettifyError(parsedParams.error));
  }

  await editWhatsAppTemplate(parsedParams.data);

  return { success: true };
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_EDIT_TEMPLATE_UNIVERSAL_IDENTIFIER,
  name: 'edit-template',
  description:
    'Change the category or the content of a WhatsApp template. An edited template goes back to review, and Meta limits how often an approved template can be edited.',
  timeoutSeconds: 30,
  handler,
  toolTriggerSettings: { inputSchema: EDIT_TEMPLATE_INPUT_SCHEMA },
});
