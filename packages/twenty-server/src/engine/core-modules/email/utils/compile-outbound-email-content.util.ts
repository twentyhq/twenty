import {
  type JSONContent,
  reactMarkupFromJSON,
  render,
  toPlainText,
} from 'twenty-emails';
import {
  type EmailDocument,
  isEmailDocumentShape,
  parseEmailDocument,
  parseJson,
} from 'twenty-shared/utils';

import { type CompiledOutboundEmailContent } from 'src/engine/core-modules/email/types/compiled-outbound-email-content.type';
import { convertPlainTextToEmailHtml } from 'src/engine/core-modules/email/utils/convert-plain-text-to-email-html.util';
import { looksLikeHtml } from 'src/engine/core-modules/email/utils/looks-like-html.util';
import { sanitizeOutboundEmailHtml } from 'src/engine/core-modules/email/utils/sanitize-outbound-email-html.util';

const renderContent = async (body: string | EmailDocument): Promise<string> => {
  const parsedBody = typeof body === 'string' ? parseJson<unknown>(body) : body;
  const parseResult = parseEmailDocument(parsedBody);

  if (parseResult.success) {
    return render(reactMarkupFromJSON(parseResult.document as JSONContent));
  }

  if (typeof body !== 'string' || isEmailDocumentShape(parsedBody)) {
    throw new Error(`Invalid outbound email document: ${parseResult.error}`);
  }

  if (looksLikeHtml(body)) {
    return body;
  }

  return convertPlainTextToEmailHtml(body);
};

export const compileOutboundEmailContent = async (
  body: string | EmailDocument,
): Promise<CompiledOutboundEmailContent> => {
  const html = await sanitizeOutboundEmailHtml(await renderContent(body));

  return {
    html,
    plainText: toPlainText(html),
  };
};
