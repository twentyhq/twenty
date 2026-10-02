import { convertPlainTextToEmailHtml } from 'src/engine/core-modules/email/utils/convert-plain-text-to-email-html.util';

describe('convertPlainTextToEmailHtml', () => {
  it('should return empty string when given empty or whitespace-only text', () => {
    expect(convertPlainTextToEmailHtml('')).toBe('');
    expect(convertPlainTextToEmailHtml('   \n\n   ')).toBe('');
  });

  it('should wrap a single line paragraph in <p> tags', () => {
    expect(convertPlainTextToEmailHtml('Hello world')).toBe(
      '<p>Hello world</p>',
    );
  });

  it('should split multiple paragraphs separated by blank lines into <p> tags', () => {
    const input = 'First paragraph.\n\nSecond paragraph.';

    expect(convertPlainTextToEmailHtml(input)).toBe(
      '<p>First paragraph.</p><p>Second paragraph.</p>',
    );
  });

  it('should convert single newlines within a paragraph into <br> tags', () => {
    const input = 'Hi Tim,\nThanks for renewing.\n\nBest,\nJane';

    expect(convertPlainTextToEmailHtml(input)).toBe(
      '<p>Hi Tim,<br>Thanks for renewing.</p><p>Best,<br>Jane</p>',
    );
  });

  it('should escape HTML special characters safely', () => {
    const input = 'Price < 5 & > 2\n\n"Double" and \'Single\' quotes';

    expect(convertPlainTextToEmailHtml(input)).toBe(
      '<p>Price &lt; 5 &amp; &gt; 2</p><p>&quot;Double&quot; and &#39;Single&#39; quotes</p>',
    );
  });

  it('should handle Windows CRLF (\\r\\n) newlines correctly', () => {
    const input = 'Line 1\r\nLine 2\r\n\r\nLine 3';

    expect(convertPlainTextToEmailHtml(input)).toBe(
      '<p>Line 1<br>Line 2</p><p>Line 3</p>',
    );
  });

  it('should collapse multiple consecutive blank lines without creating empty paragraphs', () => {
    const input = 'Para 1\n\n\n\n\nPara 2';

    expect(convertPlainTextToEmailHtml(input)).toBe(
      '<p>Para 1</p><p>Para 2</p>',
    );
  });
});
