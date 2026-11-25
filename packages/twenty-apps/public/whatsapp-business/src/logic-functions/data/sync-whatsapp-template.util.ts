import { WHATSAPP_TEMPLATE_FIELDS } from 'src/constants/whatsapp-template-fields.constant';
import { mapWhatsAppTemplateToRecordInput } from 'src/logic-functions/data/map-whatsapp-template-to-record-input.util';
import { upsertWhatsAppTemplates } from 'src/logic-functions/data/upsert-whatsapp-templates.util';
import { whatsAppApiRequest } from 'src/logic-functions/data/whatsapp-api-request.util';

export const syncWhatsAppTemplate = async ({
  accessToken,
  metaTemplateId,
  whatsAppBusinessAccountId,
}: {
  accessToken: string;
  metaTemplateId: string;
  whatsAppBusinessAccountId: string;
}) => {
  const template = await whatsAppApiRequest({
    accessToken,
    endpoint: 'GET /{templateId}',
    pathParams: { templateId: metaTemplateId },
    query: { fields: WHATSAPP_TEMPLATE_FIELDS },
  });

  await upsertWhatsAppTemplates([mapWhatsAppTemplateToRecordInput({ template, whatsAppBusinessAccountId })]);
};
