import { WHATSAPP_TEMPLATE_FIELDS } from 'src/constants/whatsapp-template-fields.constant';
import { mapWhatsappTemplateToRecordInput } from 'src/logic-functions/data/map-whatsapp-template-to-record-input.util';
import { upsertWhatsAppTemplates } from 'src/logic-functions/data/upsert-whatsapp-templates.util';
import { whatsappApiRequest } from 'src/logic-functions/data/whatsapp-api-request.util';

const TEMPLATES_PAGE_SIZE = 50;

export const importWhatsappTemplates = async ({
  accessToken,
  whatsappBusinessAccountId,
}: {
  accessToken: string;
  whatsappBusinessAccountId: string;
}) => {
  let after: string | undefined;

  do {
    const response = await whatsappApiRequest({
      accessToken,
      endpoint: 'GET /{wabaId}/message_templates',
      pathParams: { wabaId: whatsappBusinessAccountId },
      query: { fields: WHATSAPP_TEMPLATE_FIELDS, limit: TEMPLATES_PAGE_SIZE, after },
    });

    await upsertWhatsAppTemplates(
      response.data.map((template) =>
        mapWhatsappTemplateToRecordInput({ template, whatsappBusinessAccountId }),
      ),
    );
    after = response.paging?.next ? response.paging.cursors.after : undefined;
  } while (after !== undefined);
};
