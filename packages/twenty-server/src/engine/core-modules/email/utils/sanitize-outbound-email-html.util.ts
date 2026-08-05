import DOMPurify from 'dompurify';

let purifierPromise: Promise<ReturnType<typeof DOMPurify>> | undefined;

const isWhitespace = (character: string | undefined): boolean =>
  character !== undefined && /\s/u.test(character);

const isWholeHtmlDocument = (html: string): boolean => {
  let cursor = 0;

  while (cursor < html.length) {
    while (isWhitespace(html[cursor])) {
      cursor += 1;
    }

    if (!html.startsWith('<!--', cursor)) {
      break;
    }

    const commentEnd = html.indexOf('-->', cursor + 4);

    if (commentEnd === -1) {
      return false;
    }

    cursor = commentEnd + 3;
  }

  const normalizedStart = html.slice(cursor, cursor + 10).toLowerCase();

  return (
    (normalizedStart.startsWith('<!doctype') &&
      (html[cursor + 9] === '>' || isWhitespace(html[cursor + 9]))) ||
    (normalizedStart.startsWith('<html') &&
      (html[cursor + 5] === '>' || isWhitespace(html[cursor + 5])))
  );
};

const getPurifier = (): Promise<ReturnType<typeof DOMPurify>> => {
  purifierPromise ??= import('jsdom').then(({ JSDOM }) =>
    DOMPurify(new JSDOM('').window),
  );

  return purifierPromise;
};

export const sanitizeOutboundEmailHtml = async (
  html: string,
): Promise<string> =>
  (await getPurifier()).sanitize(html, {
    WHOLE_DOCUMENT: isWholeHtmlDocument(html),
  });

export const sanitizeOutboundEmailSubject = async (
  subject: string,
): Promise<string> =>
  (await getPurifier()).sanitize(subject, {
    ALLOWED_ATTR: [],
    ALLOWED_TAGS: [],
  });
