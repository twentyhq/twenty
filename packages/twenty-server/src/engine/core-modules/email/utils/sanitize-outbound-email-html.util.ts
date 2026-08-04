import DOMPurify from 'dompurify';

let purifierPromise: Promise<ReturnType<typeof DOMPurify>> | undefined;

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
    WHOLE_DOCUMENT: /^\s*(?:<!doctype|<html)/i.test(html),
  });
