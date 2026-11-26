import { isString } from '@sniptt/guards';
import { type ProposedToolCall } from 'twenty-shared/ai';
import { isEmailDocumentShape, isPlainObject } from 'twenty-shared/utils';

import { parseEmailRecipients } from '@/activities/emails/recipients/utils/parseEmailRecipients';
import { serializeJsonContentAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeJsonContentAsAdvancedTextEditorDocument';
import { type AiChatApprovalReviewEmailDraft } from '@/ai-chat/tool-calls/types/AiChatApprovalReviewEmailDraft';

export const buildAiChatApprovalReviewEmailDraft = (
  proposal: ProposedToolCall,
): AiChatApprovalReviewEmailDraft => {
  const { recipients, subject, body } = proposal.arguments;
  const recipientsByFieldId = isPlainObject(recipients) ? recipients : {};

  return {
    to: parseEmailRecipients(
      isString(recipientsByFieldId.to) ? recipientsByFieldId.to : '',
    ),
    cc: parseEmailRecipients(
      isString(recipientsByFieldId.cc) ? recipientsByFieldId.cc : '',
    ),
    bcc: parseEmailRecipients(
      isString(recipientsByFieldId.bcc) ? recipientsByFieldId.bcc : '',
    ),
    subject: isString(subject) ? subject : '',
    body: isEmailDocumentShape(body)
      ? serializeJsonContentAsAdvancedTextEditorDocument(body)
      : '',
  };
};
