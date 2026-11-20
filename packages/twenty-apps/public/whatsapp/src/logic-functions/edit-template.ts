import { isDefined } from 'twenty-sdk/utils';
import { z } from 'zod';
import { defineLogicFunction } from 'twenty-sdk/define';
import { type InputJsonSchema } from 'twenty-sdk/logic-function';
import { WHATSAPP_LOGIC_FUNCTION_EDIT_TEMPLATE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildTemplateDefinitionComponents } from 'src/logic-functions/data/build-template-definition-components.util';
import { editTemplateParamsSchema } from 'src/logic-functions/data/edit-template-params.schema';
import { findWhatsAppTemplateOrThrow } from 'src/logic-functions/data/find-whatsapp-template-or-throw.util';
import { getWhatsAppAccessTokenOrThrow } from 'src/logic-functions/data/get-whatsapp-access-token-or-throw.util';
import { syncWhatsAppTemplate } from 'src/logic-functions/data/sync-whatsapp-template.util';
import { whatsAppApiRequest } from 'src/logic-functions/data/whatsapp-api-request.util';

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

  const { templateId, category, header, body, footer, bodyExamples } = parsedParams.data;
  const template = await findWhatsAppTemplateOrThrow(templateId);
  const accessToken = await getWhatsAppAccessTokenOrThrow({
    whatsAppBusinessAccountId: template.whatsAppBusinessAccountId,
  });

  await whatsAppApiRequest({
    accessToken,
    endpoint: 'POST /{templateId}',
    pathParams: { templateId: template.metaTemplateId },
    data: {
      ...(isDefined(category) ? { category } : {}),
      ...(isDefined(body)
        ? {
            components: buildTemplateDefinitionComponents({
              header,
              body,
              footer,
              bodyExamples,
              parameterFormat: template.parameterFormat === 'NAMED' ? 'NAMED' : 'POSITIONAL',
            }),
          }
        : {}),
    },
  });

  await syncWhatsAppTemplate({
    accessToken,
    metaTemplateId: template.metaTemplateId,
    whatsAppBusinessAccountId: template.whatsAppBusinessAccountId,
  });

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
