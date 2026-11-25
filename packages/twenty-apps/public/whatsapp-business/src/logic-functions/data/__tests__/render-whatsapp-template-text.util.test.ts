import { describe, expect, it } from 'vitest';
import { renderWhatsAppTemplateText } from 'src/logic-functions/data/render-whatsapp-template-text.util';

describe('renderWhatsAppTemplateText', () => {
  it('should fill positional parameters in the header and body and keep the footer', () => {
    expect(
      renderWhatsAppTemplateText({
        components: [
          { type: 'HEADER', format: 'TEXT', text: 'Order {{1}}' },
          { type: 'BODY', text: 'Hi {{1}}, your order ships on {{2}}.' },
          { type: 'FOOTER', text: 'Reply STOP to opt out' },
        ],
        headerParameters: [{ value: '#42' }],
        bodyParameters: [{ value: 'Ada' }, { value: 'Monday' }],
        parameterFormat: 'POSITIONAL',
      }),
    ).toBe('Order #42\n\nHi Ada, your order ships on Monday.\n\nReply STOP to opt out');
  });

  it('should fill named parameters and leave unknown ones visible', () => {
    expect(
      renderWhatsAppTemplateText({
        components: [{ type: 'BODY', text: 'Hi {{first_name}}, code {{code}}' }],
        headerParameters: [],
        bodyParameters: [{ name: 'first_name', value: 'Ada' }],
        parameterFormat: 'NAMED',
      }),
    ).toBe('Hi Ada, code {{code}}');
  });

  it('should skip a media header', () => {
    expect(
      renderWhatsAppTemplateText({
        components: [
          { type: 'HEADER', format: 'IMAGE' },
          { type: 'BODY', text: 'Your invoice' },
        ],
        headerParameters: [],
        bodyParameters: [],
        parameterFormat: 'POSITIONAL',
      }),
    ).toBe('Your invoice');
  });
});
