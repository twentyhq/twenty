import { CoreApiClient } from 'twenty-client-sdk/core';
import { type WhatsAppTemplateRecordInput } from 'src/logic-functions/types/whatsapp-template-record-input.type';

// matches existing records on the unique metaTemplateId, so concurrent webhooks can't create duplicates
export const upsertWhatsAppTemplates = async (templates: WhatsAppTemplateRecordInput[]) => {
  if (templates.length === 0) {
    return;
  }

  await new CoreApiClient().mutation({
    createWhatsAppTemplates: {
      __args: { data: templates, upsert: true },
      id: true,
    },
  });
};
