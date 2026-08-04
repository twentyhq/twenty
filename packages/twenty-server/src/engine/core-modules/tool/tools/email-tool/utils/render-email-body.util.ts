import DOMPurify from 'dompurify';
import { type JSONContent } from 'twenty-emails';
import {
  type EmailDocument,
  type EmailDocumentNode,
  transformEmailDocumentStrings,
} from 'twenty-shared/utils';

import { renderRichTextToHtml } from 'src/engine/core-modules/tool/tools/email-tool/utils/render-rich-text-to-html.util';

let purifyInstance: ReturnType<typeof DOMPurify> | null = null;

const getPurify = async () => {
  if (purifyInstance === null) {
    const { JSDOM } = await import('jsdom');

    purifyInstance = DOMPurify(new JSDOM('').window);
  }

  return purifyInstance;
};

export const renderEmailBodyToHtml = async (
  body: string | EmailDocument,
): Promise<string> => {
  if (typeof body === 'string') {
    return body;
  }

  const purify = await getPurify();

  const sanitizedBody = transformEmailDocumentStrings(
    body as EmailDocumentNode,
    (value, context) => (context === 'html' ? purify.sanitize(value) : value),
  );

  return renderRichTextToHtml(sanitizedBody as JSONContent);
};
