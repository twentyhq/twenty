import { escapeHtml } from 'src/engine/core-modules/emailing-domain/utils/escape-html.util';

// The approval card edits a plain-text body, while the email tools read a
// string body as HTML, where line breaks would otherwise collapse.
export const convertPlainTextToEmailHtml = (text: string): string =>
  text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
    .map(
      (paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`,
    )
    .join('');
