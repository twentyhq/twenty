const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Wraps a document's plain-text content in a minimal, printable HTML page.
export const renderDocumentHtml = (name: string, content: string): string => {
  const safeName = escapeHtml(name);
  const safeContent = escapeHtml(content);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeName}</title>
    <style>
      body { margin: 0; background: #f4f4f5; color: #1a1a1a;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      .page { max-width: 720px; margin: 48px auto; background: #fff; padding: 64px 72px;
        border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
      h1 { font-size: 22px; margin: 0 0 32px; }
      pre { white-space: pre-wrap; word-wrap: break-word; font: inherit; margin: 0; line-height: 1.6; }
      @media print { body { background: #fff; } .page { box-shadow: none; margin: 0; } }
    </style>
  </head>
  <body>
    <div class="page">
      <h1>${safeName}</h1>
      <pre>${safeContent}</pre>
    </div>
  </body>
</html>`;
};
