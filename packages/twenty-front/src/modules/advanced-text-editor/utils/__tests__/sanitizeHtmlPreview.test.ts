import { sanitizeHtmlPreview } from '@/advanced-text-editor/utils/sanitizeHtmlPreview';

const renderPreview = (html: string): HTMLElement => {
  const container = document.createElement('div');

  document.body.appendChild(container);
  container.innerHTML = sanitizeHtmlPreview(html);

  return container;
};

const findElementsWithInlineHandlers = (container: HTMLElement): Element[] =>
  [...container.querySelectorAll('*')].filter((element) =>
    element.getAttributeNames().some((name) => name.startsWith('on')),
  );

describe('sanitizeHtmlPreview', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should not turn markup nested in noscript into live elements', () => {
    const payloads = [
      '<div>x</div><noscript><!--</noscript><img src=x onerror="alert(1)">--></noscript>',
      '<div>x</div><noscript><xmp></noscript><img src=x onerror="alert(1)"></xmp></noscript>',
      '<div>x</div><noscript><noembed></noscript><img src=x onerror="alert(1)"></noembed></noscript>',
    ];

    for (const payload of payloads) {
      expect(findElementsWithInlineHandlers(renderPreview(payload))).toEqual(
        [],
      );
    }
  });

  it('should drop style elements so they cannot restyle the page', () => {
    const container = renderPreview(
      '<p>a</p><style>body { display: none }</style>',
    );

    expect(container.querySelector('style')).toBeNull();
    expect(container.textContent).toBe('a');
  });

  it('should drop form controls', () => {
    const container = renderPreview(
      '<form action="https://example.com"><input name="email"><button>Go</button></form>',
    );

    expect(container.querySelector('form, input, button')).toBeNull();
  });

  it('should open links in a new tab without exposing the opener', () => {
    const link = renderPreview(
      '<a href="https://example.com" target="_self">x</a>',
    ).querySelector('a');

    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
  });

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
