import { transformJsxToRemoteComponents } from '@/cli/utilities/build/common/front-component-build/jsx-transform-to-remote-dom-worker-format-plugin';

describe('transformJsxToRemoteComponents', () => {
  describe('basic tag transformations', () => {
    it('should transform div tags', () => {
      const input = '<div>Hello</div>';
      const expected =
        '<RemoteComponents.HtmlDiv>Hello</RemoteComponents.HtmlDiv>';
      expect(transformJsxToRemoteComponents(input)).toBe(expected);
    });

    it('should transform span tags', () => {
      const input = '<span>Text</span>';
      const expected =
        '<RemoteComponents.HtmlSpan>Text</RemoteComponents.HtmlSpan>';
      expect(transformJsxToRemoteComponents(input)).toBe(expected);
    });

    it('should transform button tags', () => {
      const input = '<button>Click me</button>';
      const expected =
        '<RemoteComponents.HtmlButton>Click me</RemoteComponents.HtmlButton>';
      expect(transformJsxToRemoteComponents(input)).toBe(expected);
    });

    it('should transform self-closing tags', () => {
      const input = '<br />';
      const expected = '<RemoteComponents.HtmlBr />';
      expect(transformJsxToRemoteComponents(input)).toBe(expected);
    });

    it('should transform img tags with attributes', () => {
      const input = '<img src="test.png" alt="Test" />';
      const expected = '<RemoteComponents.HtmlImg src="test.png" alt="Test" />';
      expect(transformJsxToRemoteComponents(input)).toBe(expected);
    });
  });

  describe('nested elements', () => {
    it('should transform nested elements', () => {
      const input = '<div><span>Nested</span></div>';
      const expected =
        '<RemoteComponents.HtmlDiv><RemoteComponents.HtmlSpan>Nested</RemoteComponents.HtmlSpan></RemoteComponents.HtmlDiv>';
      expect(transformJsxToRemoteComponents(input)).toBe(expected);
    });

    it('should transform deeply nested elements', () => {
      const input = '<div><ul><li>Item</li></ul></div>';
      const expected =
        '<RemoteComponents.HtmlDiv><RemoteComponents.HtmlUl><RemoteComponents.HtmlLi>Item</RemoteComponents.HtmlLi></RemoteComponents.HtmlUl></RemoteComponents.HtmlDiv>';
      expect(transformJsxToRemoteComponents(input)).toBe(expected);
    });
  });

  describe('attributes preservation', () => {
    it('should preserve className attribute', () => {
      const input = '<div className="container">Content</div>';
      const expected =
        '<RemoteComponents.HtmlDiv className="container">Content</RemoteComponents.HtmlDiv>';
      expect(transformJsxToRemoteComponents(input)).toBe(expected);
    });

    it('should preserve onClick handler', () => {
      const input = '<button onClick={handleClick}>Click</button>';
      const expected =
        '<RemoteComponents.HtmlButton onClick={handleClick}>Click</RemoteComponents.HtmlButton>';
      expect(transformJsxToRemoteComponents(input)).toBe(expected);
    });

    it('should preserve multiple attributes', () => {
      const input =
        '<input type="text" value={value} onChange={handleChange} />';
      const expected =
        '<RemoteComponents.HtmlInput type="text" value={value} onChange={handleChange} />';
      expect(transformJsxToRemoteComponents(input)).toBe(expected);
    });
  });

  describe('custom components should not be transformed', () => {
    it('should not transform PascalCase components', () => {
      const input = '<MyComponent>Content</MyComponent>';
      expect(transformJsxToRemoteComponents(input)).toBe(input);
    });

    it('should not transform components starting with uppercase', () => {
      const input = '<Button>Click</Button>';
      expect(transformJsxToRemoteComponents(input)).toBe(input);
    });

    it('should transform HTML tags but not custom components in mixed content', () => {
      const input = '<div><MyComponent /></div>';
      const expected =
        '<RemoteComponents.HtmlDiv><MyComponent /></RemoteComponents.HtmlDiv>';
      expect(transformJsxToRemoteComponents(input)).toBe(expected);
    });
  });

  describe('fragments should not be transformed', () => {
    it('should not transform empty fragments', () => {
      const input = '<></>';
      expect(transformJsxToRemoteComponents(input)).toBe(input);
    });

    it('should preserve fragments with content', () => {
      const input = '<><div>Content</div></>';
      const expected =
        '<><RemoteComponents.HtmlDiv>Content</RemoteComponents.HtmlDiv></>';
      expect(transformJsxToRemoteComponents(input)).toBe(expected);
    });
  });

  describe('all supported HTML elements', () => {
    const testCases: [string, string][] = [
      ['div', 'HtmlDiv'],
      ['span', 'HtmlSpan'],
      ['section', 'HtmlSection'],
      ['article', 'HtmlArticle'],
      ['header', 'HtmlHeader'],
      ['footer', 'HtmlFooter'],
      ['main', 'HtmlMain'],
      ['nav', 'HtmlNav'],
      ['aside', 'HtmlAside'],
      ['p', 'HtmlP'],
      ['h1', 'HtmlH1'],
      ['h2', 'HtmlH2'],
      ['h3', 'HtmlH3'],
      ['h4', 'HtmlH4'],
      ['h5', 'HtmlH5'],
      ['h6', 'HtmlH6'],
      ['strong', 'HtmlStrong'],
      ['em', 'HtmlEm'],
      ['small', 'HtmlSmall'],
      ['code', 'HtmlCode'],
      ['pre', 'HtmlPre'],
      ['blockquote', 'HtmlBlockquote'],
      ['a', 'HtmlA'],
      ['img', 'HtmlImg'],
      ['ul', 'HtmlUl'],
      ['ol', 'HtmlOl'],
      ['li', 'HtmlLi'],
      ['form', 'HtmlForm'],
      ['label', 'HtmlLabel'],
      ['input', 'HtmlInput'],
      ['textarea', 'HtmlTextarea'],
      ['select', 'HtmlSelect'],
      ['option', 'HtmlOption'],
      ['button', 'HtmlButton'],
      ['table', 'HtmlTable'],
      ['thead', 'HtmlThead'],
      ['tbody', 'HtmlTbody'],
      ['tfoot', 'HtmlTfoot'],
      ['tr', 'HtmlTr'],
      ['th', 'HtmlTh'],
      ['td', 'HtmlTd'],
      ['br', 'HtmlBr'],
      ['hr', 'HtmlHr'],
    ];

    it.each(testCases)(
      'should transform <%s> to RemoteComponents.%s',
      (tag, component) => {
        const input = `<${tag}>Content</${tag}>`;
        const expected = `<RemoteComponents.${component}>Content</RemoteComponents.${component}>`;
        expect(transformJsxToRemoteComponents(input)).toBe(expected);
      },
    );
  });

  describe('edge cases', () => {
    it('should handle multiline JSX', () => {
      const input = `
        <div>
          <span>Hello</span>
        </div>
      `;
      const result = transformJsxToRemoteComponents(input);
      expect(result).toContain('<RemoteComponents.HtmlDiv>');
      expect(result).toContain('<RemoteComponents.HtmlSpan>');
      expect(result).toContain('</RemoteComponents.HtmlSpan>');
      expect(result).toContain('</RemoteComponents.HtmlDiv>');
    });

    it('should handle JSX expressions', () => {
      const input =
        '<div>{items.map(item => <span key={item.id}>{item.name}</span>)}</div>';
      const expected =
        '<RemoteComponents.HtmlDiv>{items.map(item => <RemoteComponents.HtmlSpan key={item.id}>{item.name}</RemoteComponents.HtmlSpan>)}</RemoteComponents.HtmlDiv>';
      expect(transformJsxToRemoteComponents(input)).toBe(expected);
    });
  });
});
