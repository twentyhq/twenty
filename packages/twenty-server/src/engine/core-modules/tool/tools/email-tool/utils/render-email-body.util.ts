import { type JSONContent } from 'twenty-emails';
import { type EmailDocument } from 'twenty-shared/utils';

import { renderRichTextToHtml } from 'src/engine/core-modules/tool/tools/email-tool/utils/render-rich-text-to-html.util';

// 1:1 email bodies and campaign bodies share one authoring format: the email
// document. A document renders through the same renderer campaigns use; a
// plain string is treated as ready-made HTML for compatibility.
export const renderEmailBodyToHtml = async (
  body: string | EmailDocument,
): Promise<string> => {
  if (typeof body === 'string') {
    return body;
  }

  return renderRichTextToHtml(body as JSONContent);
};
