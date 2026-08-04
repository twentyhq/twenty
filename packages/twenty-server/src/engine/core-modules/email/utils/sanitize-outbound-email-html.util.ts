import DOMPurify from 'dompurify';

let purifierPromise: Promise<ReturnType<typeof DOMPurify>> | undefined;

const HTML_DOCUMENT_START_PATTERN =
  /^(?:\s|<!--[\s\S]*?-->)*(?:<!doctype(?:\s|>)|<html(?:\s|>))/i;

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
    WHOLE_DOCUMENT: HTML_DOCUMENT_START_PATTERN.test(html),
  });

export const sanitizeOutboundEmailSubject = async (
  subject: string,
): Promise<string> =>
  (await getPurifier()).sanitize(subject, {
    ALLOWED_ATTR: [],
    ALLOWED_TAGS: [],
  });
