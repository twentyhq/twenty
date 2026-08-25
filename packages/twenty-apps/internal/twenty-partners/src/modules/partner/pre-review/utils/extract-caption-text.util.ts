import { PUBLIC_WEB_MAX_CAPTION_CHARS } from 'src/modules/partner/pre-review/connector/public-web/config';
import { decodeHtmlEntities } from 'src/modules/partner/pre-review/utils/decode-html-entities.util';

export const extractCaptionText = (
  xml: string,
  maxChars: number = PUBLIC_WEB_MAX_CAPTION_CHARS,
): string => {
  const cues = [...xml.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)].map((match) =>
    // Cues are double-encoded: the XML escapes the entities the caption itself
    // carries, so one decode pass is not enough.
    decodeHtmlEntities(decodeHtmlEntities(match[1] ?? ''))
      .replace(/\s+/g, ' ')
      .trim(),
  );

  return cues
    .filter((cue) => cue.length > 0)
    .join(' ')
    .slice(0, maxChars);
};
