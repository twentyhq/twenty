import { type JSONContent } from 'twenty-emails';
import { type EmailDocument } from 'twenty-shared/utils';

import { renderRichTextToHtml } from 'src/engine/core-modules/tool/tools/email-tool/utils/render-rich-text-to-html.util';

export const renderEmailBodyToHtml = async (
  body: string | EmailDocument,
): Promise<string> => {
  if (typeof body === 'string') {
    return body;
  }

  return renderRichTextToHtml(body as JSONContent);
};
