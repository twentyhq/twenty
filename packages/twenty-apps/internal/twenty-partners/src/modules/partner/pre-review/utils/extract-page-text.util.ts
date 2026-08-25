import { PUBLIC_WEB_MAX_EXCERPT_CHARS } from 'src/modules/partner/pre-review/connector/public-web/config';
import { decodeHtmlEntities } from 'src/modules/partner/pre-review/utils/decode-html-entities.util';

export const extractPageText = (
  html: string | null,
  maxChars: number = PUBLIC_WEB_MAX_EXCERPT_CHARS,
): string | null => {
  if (html === null) return null;

  const text = decodeHtmlEntities(
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();

  return text.length === 0 ? null : text.slice(0, maxChars);
};
