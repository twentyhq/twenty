const HTML_TAG_NAMES = [
  'a',
  'b',
  'blockquote',
  'body',
  'br',
  'center',
  'code',
  'div',
  'em',
  'font',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'hr',
  'html',
  'i',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  'section',
  'span',
  'strong',
  'style',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
].join('|');

const HTML_TAG_REGEX = new RegExp(
  `<(?:!doctype\\s+html|\\/?(?:${HTML_TAG_NAMES})\\b[^>]*>)`,
  'i',
);

export const looksLikeHtml = (value: string): boolean => {
  return HTML_TAG_REGEX.test(value);
};
