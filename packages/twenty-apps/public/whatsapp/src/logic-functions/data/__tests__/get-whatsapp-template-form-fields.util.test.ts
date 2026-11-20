import { describe, expect, it } from 'vitest';
import { getWhatsAppTemplateFormFields } from 'src/logic-functions/data/get-whatsapp-template-form-fields.util';

describe('getWhatsAppTemplateFormFields', () => {
  it('should list header, body and button inputs of a template', () => {
    expect(
      getWhatsAppTemplateFormFields([
        { type: 'HEADER', format: 'TEXT', text: 'Order {{1}}' },
        { type: 'BODY', text: 'Hi {{1}}, your order {{2}} ships {{2}}' },
        {
          type: 'BUTTONS',
          buttons: [
            { type: 'URL', text: 'Track', url: 'https://example.com/{{1}}' },
            { type: 'URL', text: 'Help', url: 'https://example.com/help' },
            { type: 'COPY_CODE', text: 'Copy code' },
            { type: 'QUICK_REPLY', text: 'Stop' },
          ],
        },
      ]),
    ).toEqual({
      headerParameterKeys: ['1'],
      headerMediaType: undefined,
      bodyParameterKeys: ['1', '2'],
      buttonInputs: [
        { index: 0, subType: 'url', label: 'Track' },
        { index: 2, subType: 'copy_code', label: 'Copy code' },
      ],
    });
  });

  it('should ask for media when the header is an image', () => {
    expect(
      getWhatsAppTemplateFormFields([{ type: 'HEADER', format: 'IMAGE' }, { type: 'BODY', text: 'Hi {{first_name}}' }]),
    ).toMatchObject({ headerMediaType: 'image', headerParameterKeys: [], bodyParameterKeys: ['first_name'] });
  });
});
