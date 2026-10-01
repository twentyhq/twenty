import { escapeHtml } from 'src/engine/core-modules/emailing-domain/utils/escape-html.util';

// email tools read a string body as HTML, where the card's plain-text line breaks would collapse
export const convertPlainTextToEmailHtml = (text: string): string =>
  text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
    .map(
      (paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`,
    )
    .join('');
