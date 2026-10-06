import {
  type JSONContent,
  reactMarkupFromJSON,
  render,
  toPlainText,
} from 'twenty-emails';
import {
  type EmailDocument,
  getFullHtmlEmailIfWholeBody,
} from 'twenty-shared/utils';

import { type CompiledOutboundEmailContent } from 'src/engine/core-modules/email/types/compiled-outbound-email-content.type';
import { sanitizeOutboundEmailHtml } from 'src/engine/core-modules/email/utils/sanitize-outbound-email-html.util';

export const compileOutboundEmailContent = async (
  document: EmailDocument,
): Promise<CompiledOutboundEmailContent> => {
  const html = await sanitizeOutboundEmailHtml(
    getFullHtmlEmailIfWholeBody(document) ??
      (await render(reactMarkupFromJSON(document as JSONContent))),
  );

  return {
    html,
    plainText: toPlainText(html),
  };
};
