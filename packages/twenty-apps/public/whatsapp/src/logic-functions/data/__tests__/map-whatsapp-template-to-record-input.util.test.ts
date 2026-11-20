import { describe, expect, it } from 'vitest';
import { mapWhatsappTemplateToRecordInput } from 'src/logic-functions/data/map-whatsapp-template-to-record-input.util';

const TEMPLATE = {
  id: '1234567890',
  name: 'order_update',
  status: 'APPROVED',
  category: 'UTILITY',
  language: 'en_US',
};

describe('mapWhatsappTemplateToRecordInput', () => {
  it('should keep the parameter format, quality and components from Meta', () => {
    expect(
      mapWhatsappTemplateToRecordInput({
        ...TEMPLATE,
        parameter_format: 'NAMED',
        quality_score: { score: 'GREEN' },
        rejected_reason: 'NONE',
        components: [{ type: 'BODY', text: 'Hi {{first_name}}' }],
      }),
    ).toEqual({
      metaTemplateId: '1234567890',
      name: 'order_update',
      language: 'en_US',
      category: 'UTILITY',
      status: 'APPROVED',
      quality: 'GREEN',
      rejectedReason: null,
      parameterFormat: 'NAMED',
      components: [{ type: 'BODY', text: 'Hi {{first_name}}' }],
    });
  });

  it('should default to positional parameters when Meta omits the format', () => {
    expect(mapWhatsappTemplateToRecordInput(TEMPLATE).parameterFormat).toBe('POSITIONAL');
  });
});
