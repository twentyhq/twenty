import { isString } from '@sniptt/guards';
import { isEmailDocumentShape, isPlainObject } from 'twenty-shared/utils';

import { parseEmailRecipients } from '@/activities/emails/recipients/utils/parseEmailRecipients';
import { serializeJsonContentAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeJsonContentAsAdvancedTextEditorDocument';
import { type AiChatApprovalReviewEmailDraft } from '@/ai-chat/tool-calls/types/AiChatApprovalReviewEmailDraft';

export const readEmailDraftFromToolArguments = (
  toolArguments: Record<string, unknown>,
): AiChatApprovalReviewEmailDraft => {
  const recipients = isPlainObject(toolArguments.recipients)
    ? toolArguments.recipients
    : {};

  return {
    to: parseEmailRecipients(isString(recipients.to) ? recipients.to : ''),
    cc: parseEmailRecipients(isString(recipients.cc) ? recipients.cc : ''),
    bcc: parseEmailRecipients(isString(recipients.bcc) ? recipients.bcc : ''),
    subject: isString(toolArguments.subject) ? toolArguments.subject : '',
    body: isEmailDocumentShape(toolArguments.body)
      ? serializeJsonContentAsAdvancedTextEditorDocument(toolArguments.body)
      : '',
  };
};
