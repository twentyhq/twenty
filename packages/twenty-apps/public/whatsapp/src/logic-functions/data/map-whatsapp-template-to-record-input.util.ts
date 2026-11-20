import { type WhatsAppTemplateRecordInput } from 'src/logic-functions/data/upsert-whatsapp-templates.util';
import { type WhatsAppApiTemplate } from 'src/logic-functions/types/whatsapp-api.type';

export const mapWhatsappTemplateToRecordInput = (
  template: WhatsAppApiTemplate,
): WhatsAppTemplateRecordInput => ({
  metaTemplateId: template.id,
  name: template.name,
  language: template.language,
  category: template.category,
  status: template.status,
  quality: template.quality_score?.score ?? null,
  rejectedReason:
    template.rejected_reason === undefined || template.rejected_reason === 'NONE'
      ? null
      : template.rejected_reason,
  parameterFormat: template.parameter_format ?? 'POSITIONAL',
  components: template.components ?? [],
});
