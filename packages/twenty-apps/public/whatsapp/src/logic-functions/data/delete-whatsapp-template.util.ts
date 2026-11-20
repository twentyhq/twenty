import { CoreApiClient } from 'twenty-client-sdk/core';
import { findWhatsAppTemplateOrThrow } from 'src/logic-functions/data/find-whatsapp-template-or-throw.util';
import { getWhatsAppAccessTokenOrThrow } from 'src/logic-functions/data/get-whatsapp-access-token-or-throw.util';
import { whatsAppApiRequest } from 'src/logic-functions/data/whatsapp-api-request.util';

export const deleteWhatsAppTemplate = async (templateId: string) => {
  const template = await findWhatsAppTemplateOrThrow(templateId);

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
};
