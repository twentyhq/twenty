import { WHATSAPP_TEMPLATE_FIELDS } from 'src/constants/whatsapp-template-fields.constant';
import { mapWhatsappTemplateToRecordInput } from 'src/logic-functions/data/map-whatsapp-template-to-record-input.util';
import { upsertWhatsAppTemplates } from 'src/logic-functions/data/upsert-whatsapp-templates.util';
import { whatsappApiRequest } from 'src/logic-functions/data/whatsapp-api-request.util';

export const syncWhatsappTemplate = async ({
  accessToken,
  metaTemplateId,
  whatsappBusinessAccountId,
}: {
  accessToken: string;
  metaTemplateId: string;
  whatsappBusinessAccountId: string;
}) => {
  const template = await whatsappApiRequest({
    accessToken,
    endpoint: 'GET /{templateId}',
    pathParams: { templateId: metaTemplateId },
    query: { fields: WHATSAPP_TEMPLATE_FIELDS },
  });

  await upsertWhatsAppTemplates([mapWhatsappTemplateToRecordInput({ template, whatsappBusinessAccountId })]);
};
