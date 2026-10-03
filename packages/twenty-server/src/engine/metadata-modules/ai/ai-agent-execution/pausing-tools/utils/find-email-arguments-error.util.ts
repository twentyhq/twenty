import { isString } from '@sniptt/guards';
import { isNonEmptyArray, parseEmailDocument } from 'twenty-shared/utils';

// the email card edits a structured document, and reads an HTML string as one; it cannot show
// attachments, so an email carrying files would send them without the person seeing them
export const findEmailArgumentsError = (
  toolArguments: Record<string, unknown>,
): string | null => {
  if (
    Array.isArray(toolArguments.files) &&
    isNonEmptyArray(toolArguments.files)
  ) {
    return 'An email with attachments cannot be proposed yet. Propose it without files, or send it yourself.';
  }

  if (isString(toolArguments.body)) {
    return null;
  }

  const parsedBody = parseEmailDocument(toolArguments.body);

  return parsedBody.success
    ? null
    : `The email body must be a structured email document ({type: "doc", content: [...]}) or an HTML string: ${parsedBody.error}`;
};
