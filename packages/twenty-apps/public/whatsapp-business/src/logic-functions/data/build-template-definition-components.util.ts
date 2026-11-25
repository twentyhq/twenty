import { type z } from 'zod';
import { isDefined } from 'twenty-sdk/utils';
import { type createTemplateParamsSchema } from 'src/logic-functions/data/create-template-params.schema';
import { type WhatsAppApiCreateTemplateRequest } from 'src/logic-functions/types/whatsapp-api.type';

type CreateTemplateParams = z.infer<typeof createTemplateParamsSchema>;

const buildBodyExample = ({
  parameterFormat,
  bodyExamples,
}: Pick<CreateTemplateParams, 'parameterFormat' | 'bodyExamples'>) => {
  if (bodyExamples.length === 0) {
    return undefined;
  }

  if (parameterFormat === 'NAMED') {
    return {
      body_text_named_params: bodyExamples.map(({ name, example }) => ({ param_name: name ?? '', example })),
    };
  }

  return { body_text: [bodyExamples.map(({ example }) => example)] };
};

export const buildTemplateDefinitionComponents = ({
  header,
  body,
  footer,
  parameterFormat,
  bodyExamples,
}: Pick<CreateTemplateParams, 'header' | 'body' | 'footer' | 'parameterFormat' | 'bodyExamples'>): WhatsAppApiCreateTemplateRequest['components'] => {
  const bodyExample = buildBodyExample({ parameterFormat, bodyExamples });

  return [
    ...(isDefined(header) ? [{ type: 'HEADER', format: 'TEXT', text: header }] : []),
    { type: 'BODY', text: body, ...(isDefined(bodyExample) ? { example: bodyExample } : {}) },
    ...(isDefined(footer) ? [{ type: 'FOOTER', text: footer }] : []),
  ];
};
