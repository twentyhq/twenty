import {
  sanitizeOutboundEmailHtml,
  sanitizeOutboundEmailSubject,
} from 'src/engine/core-modules/email/utils/sanitize-outbound-email-html.util';

describe('outbound email sanitization', () => {
  beforeAll(() => {
    jest.useRealTimers();
  });

  it('should preserve full documents preceded by comments', async () => {
    const sanitized = await sanitizeOutboundEmailHtml(
      '<!-- generated --><!doctype html><html><head><style>.hero { color: red; }</style></head><body><p class="hero">Hello</p></body></html>',
    );

    expect(sanitized).toContain('<html>');
    expect(sanitized).toContain('<head>');
    expect(sanitized).toContain('.hero { color: red; }');
    expect(sanitized).toContain('<body>');
  });

  it('should not mistake similarly prefixed elements for an HTML document', async () => {
    await expect(
      sanitizeOutboundEmailHtml('<html-preview>Hello</html-preview>'),
    ).resolves.toBe('Hello');
  });

  it('should always sanitize subjects as plain text', async () => {
    await expect(
      sanitizeOutboundEmailSubject(
        '<html><body><strong>Hello</strong><script>alert(1)</script></body></html>',
      ),
    ).resolves.toBe('Hello');
  });
});
