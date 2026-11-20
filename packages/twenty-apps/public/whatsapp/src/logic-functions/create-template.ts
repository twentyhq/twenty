import { z } from 'zod';
import { defineLogicFunction } from 'twenty-sdk/define';
import { type InputJsonSchema } from 'twenty-sdk/logic-function';
import { WHATSAPP_LOGIC_FUNCTION_CREATE_TEMPLATE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildTemplateDefinitionComponents } from 'src/logic-functions/data/build-template-definition-components.util';
import { getWhatsappAccessTokenOrThrow } from 'src/logic-functions/data/get-whatsapp-access-token-or-throw.util';
import { createTemplateParamsSchema } from 'src/logic-functions/data/create-template-params.schema';
import { upsertWhatsAppTemplates } from 'src/logic-functions/data/upsert-whatsapp-templates.util';
import { getDefaultWhatsappBusinessAccountIdOrThrow } from 'src/logic-functions/data/get-default-whatsapp-business-account-id-or-throw.util';
import { whatsappApiRequest } from 'src/logic-functions/data/whatsapp-api-request.util';

const CREATE_TEMPLATE_INPUT_SCHEMA: InputJsonSchema = {
  type: 'object',
  properties: {
    wabaId: {
      type: 'string',
      label: 'WhatsApp Business Account ID',
      description: 'Meta ID of the account that will own the template. Optional when only one account is connected.',
    },
    name: {
      type: 'string',
      label: 'Name',
      description: 'Lowercase letters, numbers and underscores only.',
    },
    language: {
      type: 'string',
      label: 'Language',
      description: 'Language code, for example en_US.',
    },
    category: {
      type: 'string',
      label: 'Category',
      description: 'UTILITY, MARKETING or AUTHENTICATION.',
    },
    parameterFormat: {
      type: 'string',
      label: 'Parameter format',
      description: 'POSITIONAL ({{1}}) or NAMED ({{first_name}}). Defaults to POSITIONAL.',
    },
    header: { type: 'string', label: 'Header', description: 'Optional text header without parameters.' },
    body: { type: 'string', label: 'Body', description: 'Message text, with parameters in double curly braces.' },
    footer: { type: 'string', label: 'Footer', description: 'Optional footer text.' },
    bodyExamples: {
      type: 'array',
      label: 'Body examples',
      description:
        'One example value per body parameter, in placeholder order. Include the parameter name for each when the format is NAMED.',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          example: { type: 'string' },
        },
        required: ['example'],
      },
    },
  },
  required: ['name', 'language', 'category', 'body'],
  additionalProperties: false,
};

const handler = async (rawParams: unknown) => {
  const parsedParams = createTemplateParamsSchema.safeParse(rawParams);

  if (!parsedParams.success) {
    return { success: false, error: z.prettifyError(parsedParams.error) };
  }

  const params = parsedParams.data;
  const components = buildTemplateDefinitionComponents(params);
  const accessToken = await getWhatsappAccessTokenOrThrow();
  const wabaId = params.wabaId ?? (await getDefaultWhatsappBusinessAccountIdOrThrow({ accessToken }));

  const response = await whatsappApiRequest({
    accessToken,
    endpoint: 'POST /{wabaId}/message_templates',
    pathParams: { wabaId },
    data: {
      name: params.name,
      category: params.category,
      language: params.language,
      parameter_format: params.parameterFormat === 'NAMED' ? 'named' : 'positional',
      components,
    },
  });

  await upsertWhatsAppTemplates([
    {
      metaTemplateId: response.id,
      name: params.name,
      language: params.language,
      category: response.category ?? params.category,
      status: response.status,
      parameterFormat: params.parameterFormat,
      components,
    },
  ]);

  return { success: true, metaTemplateId: response.id, status: response.status };
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_CREATE_TEMPLATE_UNIVERSAL_IDENTIFIER,
  name: 'create-template',
  description:
    'Submit a new WhatsApp message template to Meta for review. It can be sent once its status becomes APPROVED, usually within 24 hours.',
  timeoutSeconds: 30,
  handler,
  toolTriggerSettings: { inputSchema: CREATE_TEMPLATE_INPUT_SCHEMA },
});
