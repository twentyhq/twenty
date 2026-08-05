import { renderEmailBodyToHtml } from 'src/engine/core-modules/tool/tools/email-tool/utils/render-email-body.util';

jest.mock(
  'src/engine/core-modules/tool/tools/email-tool/utils/render-rich-text-to-html.util',
  () => ({
    renderRichTextToHtml: jest.fn().mockResolvedValue('<p>rendered html</p>'),
  }),
);

const { renderRichTextToHtml } = jest.requireMock(
  'src/engine/core-modules/tool/tools/email-tool/utils/render-rich-text-to-html.util',
);

describe('renderEmailBodyToHtml', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should pass an HTML string through untouched', async () => {
    const html = '<p>Hello <strong>there</strong></p>';

    await expect(renderEmailBodyToHtml(html)).resolves.toBe(html);
    expect(renderRichTextToHtml).not.toHaveBeenCalled();
  });

  it('should render an email document through the shared renderer', async () => {
    const document = {
      type: 'doc' as const,
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello' }],
        },
      ],
    };

    await expect(renderEmailBodyToHtml(document)).resolves.toBe(
      '<p>rendered html</p>',
    );
    expect(renderRichTextToHtml).toHaveBeenCalledWith(document);
  });
});
