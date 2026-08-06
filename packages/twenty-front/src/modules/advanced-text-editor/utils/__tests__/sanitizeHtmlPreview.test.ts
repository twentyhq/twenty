import { sanitizeHtmlPreview } from '@/advanced-text-editor/utils/sanitizeHtmlPreview';

describe('sanitizeHtmlPreview', () => {
  it('should keep benign presentational markup', () => {
    const html =
      '<table><tbody><tr><td style="padding: 8px">Hi</td></tr></tbody></table>';

    expect(sanitizeHtmlPreview(html)).toContain('padding: 8px');
    expect(sanitizeHtmlPreview(html)).toContain('Hi');
  });

  it('should remove script elements', () => {
    expect(sanitizeHtmlPreview('<p>a</p><script>alert(1)</script>')).toBe(
      '<p>a</p>',
    );
  });

  it('should remove elements that execute without a click', () => {
    expect(
      sanitizeHtmlPreview('<iframe src="javascript:alert(1)"></iframe>'),
    ).toBe('');
    expect(sanitizeHtmlPreview('<object data="x"></object>')).toBe('');
    expect(sanitizeHtmlPreview('<embed src="x">')).toBe('');
  });

  it('should strip inline handlers even without a leading space', () => {
    expect(
      sanitizeHtmlPreview('<img/onerror="alert(1)" src="x.png">'),
    ).not.toContain('onerror');
    expect(
      sanitizeHtmlPreview('<div ONCLICK="alert(1)">x</div>'),
    ).not.toContain('ONCLICK');
  });

  it('should drop javascript: links, including entity-encoded ones', () => {
    expect(
      sanitizeHtmlPreview('<a href="javascript:alert(1)">x</a>'),
    ).not.toContain('href');
    expect(
      sanitizeHtmlPreview('<a href="jav&#x61;script:alert(1)">x</a>'),
    ).not.toContain('href');
    expect(
      sanitizeHtmlPreview('<a href="java\nscript:alert(1)">x</a>'),
    ).not.toContain('href');
  });

  it('should keep ordinary links and data images', () => {
    expect(
      sanitizeHtmlPreview('<a href="https://example.com">x</a>'),
    ).toContain('href="https://example.com"');
    expect(
      sanitizeHtmlPreview('<img src="data:image/png;base64,AAAA">'),
    ).toContain('data:image/png');
  });

  it('should remove templates instead of leaving their handlers unreachable', () => {
    expect(
      sanitizeHtmlPreview(
        '<template><img src=x onerror="alert(1)"></template>',
      ),
    ).toBe('');
    expect(
      sanitizeHtmlPreview(
        '<div><template><img src=x onerror="alert(1)"></template></div>',
      ),
    ).toBe('<div></div>');
  });

  it('should strip srcdoc and formaction attributes', () => {
    expect(
      sanitizeHtmlPreview('<div srcdoc="<script>x</script>">a</div>'),
    ).not.toContain('srcdoc');
    expect(
      sanitizeHtmlPreview(
        '<button formaction="javascript:alert(1)">x</button>',
      ),
    ).not.toContain('formaction');
  });
});
