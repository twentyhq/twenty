import { WHATSAPP_TEMPLATE_FIELDS } from 'src/constants/whatsapp-template-fields.constant';
import { mapWhatsAppTemplateToRecordInput } from 'src/logic-functions/data/map-whatsapp-template-to-record-input.util';
import { upsertWhatsAppTemplates } from 'src/logic-functions/data/upsert-whatsapp-templates.util';
import { whatsAppApiRequest } from 'src/logic-functions/data/whatsapp-api-request.util';

const TEMPLATES_PAGE_SIZE = 50;

export const importWhatsAppTemplates = async ({
  accessToken,
  whatsAppBusinessAccountId,
}: {
  accessToken: string;
  whatsAppBusinessAccountId: string;
}) => {
  let after: string | undefined;

  do {
    const response = await whatsAppApiRequest({
      accessToken,
      endpoint: 'GET /{wabaId}/message_templates',
      pathParams: { wabaId: whatsAppBusinessAccountId },
      query: { fields: WHATSAPP_TEMPLATE_FIELDS, limit: TEMPLATES_PAGE_SIZE, after },
    });

    await upsertWhatsAppTemplates(
      response.data.map((template) =>
        mapWhatsAppTemplateToRecordInput({ template, whatsAppBusinessAccountId }),
      ),
    );
    after = response.paging?.next ? response.paging.cursors.after : undefined;
  } while (after !== undefined);
};
