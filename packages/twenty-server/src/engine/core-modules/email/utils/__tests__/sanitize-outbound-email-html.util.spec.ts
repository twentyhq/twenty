import {
  sanitizeOutboundEmailHtml,
  sanitizeOutboundEmailSubject,
} from 'src/engine/core-modules/email/utils/sanitize-outbound-email-html.util';

describe('outbound email sanitization', () => {
  beforeAll(() => {
    jest.useRealTimers();
  });

  it('should preserve full documents preceded by comments', async () => {
    const doctype =
      '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';
    const sanitized = await sanitizeOutboundEmailHtml(
      `<!-- generated -->${doctype}<html><head><meta content="text/html; charset=UTF-8" http-equiv="Content-Type"><meta name="x-apple-disable-message-reformatting"><style>.hero { color: red; }</style></head><body><p class="hero">Hello</p></body></html>`,
    );

    expect(sanitized.startsWith(`${doctype}<html>`)).toBe(true);
    expect(sanitized).toContain('<head>');
    expect(sanitized).toContain(
      '<meta content="text/html; charset=UTF-8" http-equiv="Content-Type">',
    );
    expect(sanitized).toContain(
      '<meta name="x-apple-disable-message-reformatting">',
    );
    expect(sanitized).toContain('.hero { color: red; }');
    expect(sanitized).toContain('<body>');
  });

  it('should reject active meta directives', async () => {
    const sanitized = await sanitizeOutboundEmailHtml(
      '<!doctype html><html><head><meta http-equiv="refresh" content="0;url=https://evil.test"></head><body>Hello</body></html>',
    );

    expect(sanitized).not.toContain('http-equiv="refresh"');
  });

  it('should scan repeated leading comments without regex backtracking', async () => {
    const comments = '<!---->'.repeat(2_000);

    const sanitized = await sanitizeOutboundEmailHtml(
      `${comments}<html><body><p>Hello</p></body></html>`,
    );

    expect(sanitized).toContain('<html>');
    expect(sanitized).toContain('<p>Hello</p>');
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

  it('should preserve plain-text subject characters without entity encoding', async () => {
    await expect(
      sanitizeOutboundEmailSubject('Price < 100 & ready'),
    ).resolves.toBe('Price < 100 & ready');
  });

  it('should collapse header control characters', async () => {
    await expect(
      sanitizeOutboundEmailSubject('Hello\r\nBcc: hidden@example.com'),
    ).resolves.toBe('Hello Bcc: hidden@example.com');
  });
});
