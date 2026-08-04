import { type EmailDocument } from 'twenty-shared/utils';

import { compileOutboundEmailContent } from 'src/engine/core-modules/email/utils/compile-outbound-email-content.util';

const compileDocument = async (document: EmailDocument): Promise<string> =>
  (await compileOutboundEmailContent(document)).html;

describe('compileOutboundEmailContent', () => {
  beforeAll(() => {
    jest.useRealTimers();
  });
  it('should render an email section with its inline styles', async () => {
    const html = await compileDocument({
      type: 'doc',
      content: [
        {
          type: 'section',
          attrs: { style: { backgroundColor: '#f4f4f5', padding: '24px' } },
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
    const html = await compileDocument({
      type: 'doc',
      content: [
        {
          type: 'columns',
          attrs: { style: {} },
          content: [
            {
              type: 'column',
              attrs: { style: {} },
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Left cell' }],
                },
              ],
            },
            {
              type: 'column',
              attrs: { style: {} },
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
    const html = await compileDocument({
      type: 'doc',
      content: [
        {
          type: 'button',
          attrs: {
            href: 'https://twenty.com',
            style: { backgroundColor: '#1961ed', color: '#ffffff' },
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
    const html = await compileDocument({
      type: 'doc',
      content: [
        {
          type: 'divider',
          attrs: { style: { borderTop: '2px dashed #ff0000' } },
        },
      ],
    });

    expect(html).toContain('<hr');
    expect(html).toContain('2px dashed #ff0000');
  });

  it('should wrap themed documents in a styled page and centered container', async () => {
    const html = await compileDocument({
      type: 'doc',
      attrs: {
        canvasTheme: {
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
    const html = await compileDocument({
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

  it('should embed safe raw HTML blocks', async () => {
    const html = await compileDocument({
      type: 'doc',
      content: [
        {
          type: 'html',
          attrs: {
            html: '<table role="presentation"><tr><td>custom cell</td></tr></table>',
          },
        },
      ],
    });

    expect(html).toContain('custom cell');
    expect(html).toContain('<table role="presentation">');
  });

  it('should wrap linked images in an anchor', async () => {
    const html = await compileDocument({
      type: 'doc',
      content: [
        {
          type: 'image',
          attrs: {
            src: 'https://example.com/banner.png',
            alt: 'Banner',
            href: 'https://example.com/landing',
          },
        },
      ],
    });

    expect(html).toContain('https://example.com/banner.png');
    expect(html).toContain('href="https://example.com/landing"');
    expect(html).toContain('alt="Banner"');
  });

  it('should reject unknown structured nodes before rendering', async () => {
    await expect(
      compileOutboundEmailContent({
        type: 'doc',
        content: [
          {
            type: 'someFutureNode',
            content: [{ type: 'text', text: 'lost' }],
          },
        ],
      } as unknown as EmailDocument),
    ).rejects.toThrow('Invalid outbound email document');
  });

  it('should sanitize structured and legacy HTML with the same policy', async () => {
    const structured = await compileDocument({
      type: 'doc',
      content: [
        {
          type: 'html',
          attrs: {
            html: '<a href="javascript:alert(1)" onclick="alert(1)">Open</a><script>alert(1)</script>',
          },
        },
      ],
    });
    const legacy = await compileOutboundEmailContent(
      '<a href="javascript:alert(1)" onclick="alert(1)">Open</a><script>alert(1)</script>',
    );

    for (const html of [structured, legacy.html]) {
      expect(html).toContain('Open');
      expect(html).not.toContain('javascript:');
      expect(html).not.toContain('onclick');
      expect(html).not.toContain('<script');
    }
  });

  it('should derive plain text from the sanitized HTML', async () => {
    await expect(
      compileOutboundEmailContent('<p>Hello <strong>Ada</strong></p>'),
    ).resolves.toEqual({
      html: '<p>Hello <strong>Ada</strong></p>',
      plainText: 'Hello Ada',
    });
  });

  describe('unsafe URL schemes', () => {
    it('should drop javascript: hrefs from buttons, links and images', async () => {
      const html = await renderRichTextToHtml({
        type: 'doc',
        content: [
          {
            type: 'button',
            attrs: { href: 'javascript:alert(1)', style: {} },
            content: [{ type: 'text', text: 'Click' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'link',
                marks: [
                  { type: 'link', attrs: { href: ' javascript:alert(1)' } },
                ],
              },
            ],
          },
          {
            type: 'image',
            attrs: { src: 'javascript:alert(1)', href: 'data:text/html,x' },
          },
        ],
      });

      expect(html).not.toContain('javascript:');
      expect(html).not.toContain('data:text/html');
    });

    it('should keep http, mailto and variable-bearing URLs', async () => {
      const html = await renderRichTextToHtml({
        type: 'doc',
        content: [
          {
            type: 'button',
            attrs: { href: 'https://hello/{{personId}}', style: {} },
            content: [{ type: 'text', text: 'Go' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'mail',
                marks: [{ type: 'link', attrs: { href: 'mailto:a@b.c' } }],
              },
            ],
          },
        ],
      });

      expect(html).toContain('https://hello/{{personId}}');
      expect(html).toContain('mailto:a@b.c');
    });
  });
});
