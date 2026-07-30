import { renderRichTextToHtml } from 'src/engine/core-modules/tool/tools/email-tool/utils/render-rich-text-to-html.util';

describe('renderRichTextToHtml', () => {
  // react-email's render() awaits real async work; the globally enabled fake
  // timers would stall it forever.
  beforeAll(() => {
    jest.useRealTimers();
  });
  it('should render an email section with its inline styles', async () => {
    const html = await renderRichTextToHtml({
      type: 'doc',
      content: [
        {
          type: 'emailSection',
          attrs: { style: 'background-color: #f4f4f5; padding: 24px;' },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Inside the section' }],
            },
          ],
        },
      ],
    });

    expect(html).toContain('Inside the section');
    expect(html).toContain('background-color:#f4f4f5');
    expect(html).toContain('padding:24px');
  });

  it('should render columns as a table row with one cell per column', async () => {
    const html = await renderRichTextToHtml({
      type: 'doc',
      content: [
        {
          type: 'emailColumns',
          content: [
            {
              type: 'emailColumn',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Left cell' }],
                },
              ],
            },
            {
              type: 'emailColumn',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Right cell' }],
                },
              ],
            },
          ],
        },
      ],
    });

    expect(html).toContain('Left cell');
    expect(html).toContain('Right cell');
    expect(html).toContain('width:50%');
  });

  it('should render a button as a styled link', async () => {
    const html = await renderRichTextToHtml({
      type: 'doc',
      content: [
        {
          type: 'emailButton',
          attrs: {
            href: 'https://twenty.com',
            style: 'background-color: #1961ed; color: #ffffff;',
          },
          content: [{ type: 'text', text: 'Visit Twenty' }],
        },
      ],
    });

    expect(html).toContain('Visit Twenty');
    expect(html).toContain('https://twenty.com');
    expect(html).toContain('background-color:#1961ed');
  });

  it('should render a divider as an hr with its styles', async () => {
    const html = await renderRichTextToHtml({
      type: 'doc',
      content: [
        {
          type: 'emailDivider',
          attrs: { style: 'border-top: 2px dashed #ff0000;' },
        },
      ],
    });

    expect(html).toContain('<hr');
    expect(html).toContain('2px dashed #ff0000');
  });

  it('should wrap themed documents in a styled page and centered container', async () => {
    const html = await renderRichTextToHtml({
      type: 'doc',
      attrs: {
        emailTheme: {
          pageBackground: '#f4f4f5',
          bodyBackground: '#ffffff',
          textColor: '#18181b',
          width: '600px',
          padding: '24px',
          cornerRadius: '8px',
          border: 'none',
        },
      },
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Themed content' }],
        },
      ],
    });

    expect(html).toContain('Themed content');
    expect(html).toContain('background-color:#f4f4f5');
    expect(html).toContain('background-color:#ffffff');
    expect(html).toContain('max-width:600px');
  });

  it('should keep the bare body for documents without a theme', async () => {
    const html = await renderRichTextToHtml({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Workflow email' }],
        },
      ],
    });

    expect(html).toContain('Workflow email');
    expect(html).not.toContain('max-width:600px');
  });

  it('should embed raw HTML blocks verbatim', async () => {
    const html = await renderRichTextToHtml({
      type: 'doc',
      content: [
        {
          type: 'emailHtml',
          attrs: {
            html: '<table role="presentation"><tr><td>custom cell</td></tr></table>',
          },
        },
      ],
    });

    expect(html).toContain('custom cell');
    expect(html).toContain('<table role="presentation">');
  });

  it('should render nothing for unknown node types', async () => {
    const html = await renderRichTextToHtml({
      type: 'doc',
      content: [
        { type: 'someFutureNode', content: [{ type: 'text', text: 'lost' }] },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'still rendered' }],
        },
      ],
    });

    expect(html).not.toContain('lost');
    expect(html).toContain('still rendered');
  });
});
