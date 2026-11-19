import { type EmailDocument, parseEmailDocument } from 'twenty-shared/utils';

import {
  EmailToolException,
  EmailToolExceptionCode,
} from 'src/engine/core-modules/tool/tools/email-tool/exceptions/email-tool.exception';

export const parseEmailDocumentOrThrow = (value: unknown): EmailDocument => {
  const parseResult = parseEmailDocument(value);

  if (!parseResult.success) {
    throw new EmailToolException(
      `Invalid email document: ${parseResult.error}`,
      EmailToolExceptionCode.INVALID_EMAIL_BODY,
    );
  }

  return parseResult.document;
};
