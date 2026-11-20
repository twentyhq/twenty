import { type z } from 'zod';
import { type createTemplateParamsSchema } from 'src/logic-functions/data/create-template-params.schema';
import { type WhatsAppApiCreateTemplateRequest } from 'src/logic-functions/types/whatsapp-api.type';

type CreateTemplateParams = z.infer<typeof createTemplateParamsSchema>;

export const buildTemplateDefinitionComponents = ({
  header,
  body,
  footer,
  parameterFormat,
  bodyExamples,
}: Pick<CreateTemplateParams, 'header' | 'body' | 'footer' | 'parameterFormat' | 'bodyExamples'>): WhatsAppApiCreateTemplateRequest['components'] => {
  const bodyExample =
    bodyExamples.length === 0
      ? undefined
      : parameterFormat === 'NAMED'
        ? {
            body_text_named_params: bodyExamples.map(({ name, example }) => ({
              param_name: name ?? '',
              example,
            })),
          }
        : { body_text: [bodyExamples.map(({ example }) => example)] };

  return [
    ...(header === undefined ? [] : [{ type: 'HEADER', format: 'TEXT', text: header }]),
    { type: 'BODY', text: body, ...(bodyExample ? { example: bodyExample } : {}) },
    ...(footer === undefined ? [] : [{ type: 'FOOTER', text: footer }]),
  ];
};
