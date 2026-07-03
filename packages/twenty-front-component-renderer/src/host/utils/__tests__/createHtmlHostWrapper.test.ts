import './setupServerRenderingGlobals';

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { createHtmlHostWrapper } from '../createHtmlHostWrapper';

const renderWrapper = (
  htmlTag: string,
  props: Record<string, unknown>,
  children?: string,
): string =>
  renderToStaticMarkup(
    createElement(createHtmlHostWrapper(htmlTag), props, children),
  );

describe('createHtmlHostWrapper prop hardening', () => {
  it('should drop an on* attribute whose value is not a function', () => {
    const markup = renderWrapper('div', { onmouseover: 'alert(1)' });

    expect(markup).not.toContain('onmouseover');
    expect(markup).not.toContain('alert(1)');
  });

  it('should drop a normalized event attribute whose value is not a function', () => {
    const markup = renderWrapper('div', { onClick: 'alert(1)' });

    expect(markup).not.toContain('alert(1)');
  });

  it('should drop a javascript: url on href', () => {
    const markup = renderWrapper('a', { href: 'javascript:alert(1)' }, 'link');

    expect(markup).not.toContain('javascript:');
  });

  it('should drop a data: url on href', () => {
    const markup = renderWrapper(
      'a',
      { href: 'data:text/html,<script>alert(1)</script>' },
      'link',
    );

    expect(markup).not.toContain('data:');
  });

  it('should drop a vbscript: url on href', () => {
    const markup = renderWrapper('a', { href: 'vbscript:msgbox(1)' }, 'link');

    expect(markup).not.toContain('vbscript:');
  });

  it('should drop a javascript: url on an anchor xlink:href', () => {
    const markup = renderWrapper(
      'a',
      { 'xlink:href': 'javascript:alert(1)' },
      'link',
    );

    expect(markup).not.toContain('javascript:');
  });

  it('should drop a javascript: url on a React-style anchor xlinkHref', () => {
    const markup = renderWrapper(
      'a',
      { xlinkHref: 'javascript:alert(1)' },
      'link',
    );

    expect(markup).not.toContain('javascript:');
  });

  it('should drop a javascript: url obfuscated with control characters', () => {
    const markup = renderWrapper(
      'a',
      { href: 'java\tscript:alert(1)' },
      'link',
    );

    expect(markup).not.toContain('script:');
  });

  it('should keep a safe href', () => {
    const markup = renderWrapper('a', { href: 'https://twenty.com' }, 'link');

    expect(markup).toContain('href="https://twenty.com"');
  });

  it('should keep a data: image on src', () => {
    const dataImageUrl = 'data:image/png;base64,iVBORw0KGgo=';
    const markup = renderWrapper('img', { src: dataImageUrl });

    expect(markup).toContain(dataImageUrl);
  });
});
