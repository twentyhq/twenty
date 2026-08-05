import DOMPurify from 'dompurify';

let purifierPromise: Promise<ReturnType<typeof DOMPurify>> | undefined;

const MAX_DOCTYPE_LENGTH = 512;
const SUBJECT_CONTROL_CHARACTERS_PATTERN =
  /[\u0000-\u001f\u007f\u0080-\u009f]+/g;

const isWhitespace = (character: string | undefined): boolean =>
  character !== undefined && /\s/u.test(character);

type HtmlDocumentPreamble = {
  isWholeDocument: boolean;
  doctype?: string;
};

const inspectHtmlDocumentPreamble = (html: string): HtmlDocumentPreamble => {
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
      return { isWholeDocument: false };
    }

    cursor = commentEnd + 3;
  }

  const normalizedStart = html.slice(cursor, cursor + 10).toLowerCase();

  const startsWithDoctype =
    normalizedStart.startsWith('<!doctype') &&
    (html[cursor + 9] === '>' || isWhitespace(html[cursor + 9]));

  if (startsWithDoctype) {
    const doctypeEnd = html.indexOf('>', cursor + 9);
    const doctype =
      doctypeEnd !== -1 && doctypeEnd - cursor < MAX_DOCTYPE_LENGTH
        ? html.slice(cursor, doctypeEnd + 1)
        : undefined;
    const normalizedDoctype = doctype?.toLowerCase();
    const htmlNameBoundary = normalizedDoctype?.[14];
    const isHtmlDoctype =
      normalizedDoctype?.startsWith('<!doctype html') === true &&
      (htmlNameBoundary === '>' || isWhitespace(htmlNameBoundary));

    return {
      isWholeDocument: true,
      ...(isHtmlDoctype && { doctype }),
    };
  }

  return {
    isWholeDocument:
      normalizedStart.startsWith('<html') &&
      (html[cursor + 5] === '>' || isWhitespace(html[cursor + 5])),
  };
};

const getPurifier = (): Promise<ReturnType<typeof DOMPurify>> => {
  purifierPromise ??= import('jsdom').then(({ JSDOM }) => {
    const purifier = DOMPurify(new JSDOM('').window);

    purifier.addHook('uponSanitizeAttribute', (node, attribute) => {
      if (
        node.nodeName === 'META' &&
        attribute.attrName === 'http-equiv' &&
        attribute.attrValue.trim().toLowerCase() !== 'content-type'
      ) {
        attribute.keepAttr = false;
      }
    });

    return purifier;
  });

  return purifierPromise;
};

export const sanitizeOutboundEmailHtml = async (
  html: string,
): Promise<string> => {
  const preamble = inspectHtmlDocumentPreamble(html);
  const sanitizedHtml = (await getPurifier()).sanitize(html, {
    WHOLE_DOCUMENT: preamble.isWholeDocument,
    ...(preamble.isWholeDocument && {
      ADD_TAGS: ['meta'],
      ADD_ATTR: ['charset', 'content', 'http-equiv', 'name'],
    }),
  });

  // DOMPurify intentionally removes document types and comments. Restore the
  // inert doctype so email clients stay in standards mode; conditional comments
  // remain stripped because preserving arbitrary commented markup would create
  // a sanitizer bypass for raw HTML blocks and legacy bodies.
  return preamble.doctype === undefined
    ? sanitizedHtml
    : `${preamble.doctype}${sanitizedHtml}`;
};

export const sanitizeOutboundEmailSubject = async (
  subject: string,
): Promise<string> => {
  const sanitizedSubject = (await getPurifier()).sanitize(subject, {
    ALLOWED_ATTR: [],
    ALLOWED_TAGS: [],
    RETURN_DOM_FRAGMENT: true,
  });

  return (sanitizedSubject.textContent ?? '').replace(
    SUBJECT_CONTROL_CHARACTERS_PATTERN,
    ' ',
  );
};
