import { type ProposedToolCall } from 'twenty-shared/ai';
import {
  convertEmailBodyToEmailDocument,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { z } from 'zod';

import { EmailToolInputZodSchema } from 'src/engine/core-modules/tool/tools/email-tool/email-tool.schema';
import { type ProposedToolCallResolution } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/proposed-tool-call-resolution.type';

// the email tools' own schema decides what can be proposed; the card cannot show attachments,
// so an email carrying files would send them without the person seeing them; the body is stored
// as the document it will be sent as, so the card never has to interpret a string
export const buildEmailProposal = (
  baseProposal: Omit<ProposedToolCall, 'template'>,
): ProposedToolCallResolution => {
  const parsedArguments = EmailToolInputZodSchema.safeParse(
    baseProposal.arguments,
  );

  if (!parsedArguments.success) {
    return {
      error: `The email arguments do not match the email tool's input schema: ${z.prettifyError(parsedArguments.error)}`,
    };
  }

  if (isNonEmptyArray(parsedArguments.data.files)) {
    return {
      error:
        'An email with attachments cannot be proposed yet. Propose it without files, or send it yourself.',
    };
  }

  const bodyConversionResult = convertEmailBodyToEmailDocument(
    parsedArguments.data.body,
  );

  if (!bodyConversionResult.success) {
    return {
      error: `The email body is not a valid email document: ${bodyConversionResult.error}`,
    };
  }

  return {
    proposal: {
      ...baseProposal,
      arguments: {
        ...baseProposal.arguments,
        body: bodyConversionResult.document,
      },
      template: 'email',
    },
  };
};
