import { isString } from '@sniptt/guards';

import {
  EMAIL_DOCUMENT_SCHEMA_VERSION,
  isEmailDocumentShape,
  isPlainObject,
  parseEmailDocument,
  parseJson,
} from 'twenty-shared/utils';

import { convertStringBodyToEmailDocument } from 'src/database/commands/upgrade-version-command/2-47/utils/convert-string-body-to-email-document.util';

export const convertEmailBodyToEmailDocument = (emailBody: unknown) => {
  const emailBodyAsJson = isString(emailBody)
    ? parseJson<unknown>(emailBody)
    : emailBody;

  if (!isEmailDocumentShape(emailBodyAsJson)) {
    return isString(emailBody)
      ? {
          success: true as const,
          document: convertStringBodyToEmailDocument(emailBody),
        }
      : parseEmailDocument(emailBodyAsJson);
  }

  const existingAttributes =
    'attrs' in emailBodyAsJson && isPlainObject(emailBodyAsJson.attrs)
      ? emailBodyAsJson.attrs
      : {};

  return parseEmailDocument({
    ...emailBodyAsJson,
    attrs: {
      ...existingAttributes,
      schemaVersion:
        existingAttributes.schemaVersion ?? EMAIL_DOCUMENT_SCHEMA_VERSION,
    },
  });
};
