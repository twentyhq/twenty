import {
  type JSONContent,
  reactMarkupFromJSON,
  render,
  toPlainText,
} from 'twenty-emails';
import {
  type EmailDocument,
  parseEmailDocument,
  parseJson,
} from 'twenty-shared/utils';

import { type CompiledOutboundEmailContent } from 'src/engine/core-modules/email/types/compiled-outbound-email-content.type';
import { sanitizeOutboundEmailHtml } from 'src/engine/core-modules/email/utils/sanitize-outbound-email-html.util';

const isDocumentShape = (value: unknown): boolean =>
  typeof value === 'object' &&
  value !== null &&
  'type' in value &&
  value.type === 'doc';

const renderContent = async (body: string | EmailDocument): Promise<string> => {
  const parsedBody = typeof body === 'string' ? parseJson<unknown>(body) : body;
  const parseResult = parseEmailDocument(parsedBody);

  if (parseResult.success) {
    return render(reactMarkupFromJSON(parseResult.document as JSONContent));
  }

  if (typeof body !== 'string' || isDocumentShape(parsedBody)) {
    throw new Error(`Invalid outbound email document: ${parseResult.error}`);
  }

  return body;
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
