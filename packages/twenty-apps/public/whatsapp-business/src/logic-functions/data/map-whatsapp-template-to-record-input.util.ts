import { type WhatsAppTemplateRecordInput } from 'src/logic-functions/types/whatsapp-template-record-input.type';
import { type WhatsAppApiTemplate } from 'src/logic-functions/types/whatsapp-api.type';

export const mapWhatsAppTemplateToRecordInput = ({
  template,
  whatsAppBusinessAccountId,
}: {
  template: WhatsAppApiTemplate;
  whatsAppBusinessAccountId: string;
}): WhatsAppTemplateRecordInput => ({
  metaTemplateId: template.id,
  whatsAppBusinessAccountId,
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
