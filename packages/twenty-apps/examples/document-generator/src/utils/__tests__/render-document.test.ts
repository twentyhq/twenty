import { describe, expect, it } from 'vitest';

import { documentContentToHtml, documentHtmlPage } from '../render-document';

describe('documentContentToHtml', () => {
  it('should render markdown to html', () => {
    const html = documentContentToHtml('# Hi\n\n**bold** and a list:\n\n- one\n- two');

    expect(html).toContain('<h1>Hi</h1>');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<li>one</li>');
  });

  it('should drop raw html to prevent injection', () => {
    const html = documentContentToHtml('Hello <script>alert(1)</script>');

    expect(html).not.toContain('<script>');
  });

  it('should neutralize unsafe link protocols', () => {
    const html = documentContentToHtml('[x](javascript:alert(1))');

    expect(html).not.toContain('javascript:');
  });

  it('should drop images so no external <img> is emitted', () => {
    const html = documentContentToHtml('![alt](https://evil.example/x.png)');

    expect(html).not.toContain('<img');
    expect(html).not.toContain('evil.example');
  });

  it('should escape link href and text', () => {
    const html = documentContentToHtml('[a"b](https://example.com/?x="y"&z=1)');

    expect(html).not.toContain('="y"');
    expect(html).toContain('&quot;');
    expect(html).toContain('&amp;');
  });
});

describe('documentHtmlPage', () => {
  it('should wrap content in a titled, styled page', () => {
    const page = documentHtmlPage('Proposal', 'Body text');

    expect(page).toContain('<!doctype html>');
    expect(page).toContain('<title>Proposal</title>');
    expect(page).toContain('doc-paper');
  });

  it('should escape the title', () => {
    const page = documentHtmlPage('<script>', 'x');

    expect(page).toContain('&lt;script&gt;');
  });
});
