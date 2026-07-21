import { Marked } from 'marked';

// A Markdown renderer hardened for untrusted template content: raw HTML is
// dropped and only http(s)/mailto links survive, so the output is safe to
// inject into the page or the front-end viewer.
const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const markdown = new Marked({ async: false, gfm: true, breaks: true });

markdown.use({
  renderer: {
    html() {
      return '';
    },
    // Drop images entirely — they would emit <img> tags pointing at arbitrary
    // external URLs, which the "no raw HTML" contract is meant to prevent.
    image() {
      return '';
    },
    link({ href, text }: { href: string; text: string }) {
      const isSafe = /^(https?:|mailto:)/i.test(href ?? '');
      // Escape both values: href lands in an attribute and text in element
      // content, so unescaped input would otherwise inject markup.
      const safeText = escapeHtml(text ?? '');

      return isSafe
        ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${safeText}</a>`
        : safeText;
    },
  },
});

export const documentContentToHtml = (content: string): string =>
  markdown.parse(content) as string;

// The "paper" styling only (no `body` rules), so it is safe to inject inside a
// front component without leaking styles onto the host page.
export const DOCUMENT_PAPER_CSS = `
  .doc-paper {
    color: #1f2430;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif;
    line-height: 1.7;
    max-width: 720px;
    margin: 48px auto;
    background: #ffffff;
    border-radius: 10px;
    box-shadow: 0 10px 40px rgba(24, 39, 75, 0.08);
    overflow: hidden;
  }
  .doc-body { padding: 64px 72px 72px; }
  .doc-body h1, .doc-body h2, .doc-body h3 { color: #10152a; line-height: 1.3; margin: 32px 0 12px; }
  .doc-body h1 { font-size: 24px; } .doc-body h2 { font-size: 20px; } .doc-body h3 { font-size: 16px; }
  .doc-body p { margin: 0 0 16px; }
  .doc-body ul, .doc-body ol { margin: 0 0 16px; padding-left: 24px; }
  .doc-body li { margin: 4px 0; }
  .doc-body a { color: #1961ed; text-decoration: none; }
  .doc-body a:hover { text-decoration: underline; }
  .doc-body blockquote {
    margin: 16px 0; padding: 4px 20px; border-left: 3px solid #1961ed;
    color: #47506a; background: #f6f8fd;
  }
  .doc-body code {
    font-family: 'SFMono-Regular', Menlo, monospace; font-size: 0.9em;
    background: #f1f3f9; padding: 2px 6px; border-radius: 4px;
  }
  .doc-body hr { border: 0; border-top: 1px solid #e6e9f2; margin: 32px 0; }
  @media print {
    body { background: #fff; }
    .doc-paper { box-shadow: none; margin: 0; border-radius: 0; max-width: none; }
  }
`;

// Inner markup for the styled "paper": renders the template content only, with
// no title header or footer chrome.
export const documentPaperHtml = (content: string): string =>
  `<article class="doc-paper">
      <div class="doc-body">
        ${documentContentToHtml(content)}
      </div>
    </article>`;

const PAGE_BODY_CSS = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: #eef1f6;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif;
  }
`;

// A complete, printable HTML page for the public view route.
export const documentHtmlPage = (title: string, content: string): string => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>${PAGE_BODY_CSS}${DOCUMENT_PAPER_CSS}</style>
  </head>
  <body>
    ${documentPaperHtml(content)}
  </body>
</html>`;
