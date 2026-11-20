import { CoreApiClient } from 'twenty-client-sdk/core';

export type WhatsAppTemplateRecordInput = {
  metaTemplateId: string;
  name: string;
  language: string;
  category?: string;
  status?: string;
  quality?: string | null;
  rejectedReason?: string | null;
  parameterFormat?: string;
  components?: object;
};

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
