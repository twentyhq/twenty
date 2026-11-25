export type WhatsAppTemplateRecordInput = {
  metaTemplateId: string;
  whatsAppBusinessAccountId?: string;
  name: string;
  language: string;
  category?: string;
  status?: string;
  quality?: string | null;
  rejectedReason?: string | null;
  parameterFormat?: string;
  components?: object;
};
