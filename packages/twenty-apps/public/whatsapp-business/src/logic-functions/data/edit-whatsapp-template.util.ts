import { type z } from 'zod';
import { isDefined } from 'twenty-sdk/utils';
import { buildTemplateDefinitionComponents } from 'src/logic-functions/data/build-template-definition-components.util';
import { type editTemplateParamsSchema } from 'src/logic-functions/data/edit-template-params.schema';
import { findWhatsAppTemplateOrThrow } from 'src/logic-functions/data/find-whatsapp-template-or-throw.util';
import { getWhatsAppAccessTokenOrThrow } from 'src/logic-functions/data/get-whatsapp-access-token-or-throw.util';
import { syncWhatsAppTemplate } from 'src/logic-functions/data/sync-whatsapp-template.util';
import { whatsAppApiRequest } from 'src/logic-functions/data/whatsapp-api-request.util';

export const editWhatsAppTemplate = async ({
  templateId,
  category,
  header,
  body,
  footer,
  bodyExamples,
}: z.infer<typeof editTemplateParamsSchema>) => {
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
};
