import { describe, expect, it } from 'vitest';
import { buildTemplateComponents } from 'src/logic-functions/data/build-template-components.util';

describe('buildTemplateComponents', () => {
  it('should build header media, body and button components', () => {
    expect(
      buildTemplateComponents({
        bodyParameters: [{ value: 'Ada' }],
        headerParameters: [],
        headerMedia: { type: 'document', link: 'https://example.com/invoice.pdf', filename: 'invoice.pdf' },
        buttonParameters: [
          { index: 0, subType: 'url', value: 'order/42' },
          { index: 1, subType: 'copy_code', value: 'SAVE10' },
        ],
        parameterFormat: 'POSITIONAL',
      }),
    ).toEqual([
      {
        type: 'header',
        parameters: [
          { type: 'document', document: { link: 'https://example.com/invoice.pdf', filename: 'invoice.pdf' } },
        ],
      },
      { type: 'body', parameters: [{ type: 'text', text: 'Ada' }] },
      { type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: 'order/42' }] },
      {
        type: 'button',
        sub_type: 'copy_code',
        index: '1',
        parameters: [{ type: 'coupon_code', coupon_code: 'SAVE10' }],
      },
    ]);
  });

  it('should name header and body parameters for named templates', () => {
    expect(
      buildTemplateComponents({
        bodyParameters: [{ name: 'first_name', value: 'Ada' }],
        headerParameters: [{ name: 'order_id', value: '42' }],
        buttonParameters: [],
        parameterFormat: 'NAMED',
      }),
    ).toEqual([
      { type: 'header', parameters: [{ type: 'text', text: '42', parameter_name: 'order_id' }] },
      { type: 'body', parameters: [{ type: 'text', text: 'Ada', parameter_name: 'first_name' }] },
    ]);
  });

  it('should reject unnamed parameters for named templates', () => {
    expect(() =>
      buildTemplateComponents({
        bodyParameters: [{ value: 'Ada' }],
        headerParameters: [],
        buttonParameters: [],
        parameterFormat: 'NAMED',
      }),
    ).toThrow();
  });

  it('should return no components when nothing is parameterised', () => {
    expect(
      buildTemplateComponents({
        bodyParameters: [],
        headerParameters: [],
        buttonParameters: [],
        parameterFormat: 'POSITIONAL',
      }),
    ).toBeUndefined();
  });
});
