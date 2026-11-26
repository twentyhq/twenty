import { type ProposedToolCall } from 'twenty-shared/ai';
import { parseCanonicalTipTapJsonDocument } from 'twenty-shared/utils';

import { serializeEmailRecipients } from '@/activities/emails/recipients/utils/serializeEmailRecipients';
import { type AiChatApprovalReviewEmailDraft } from '@/ai-chat/tool-calls/types/AiChatApprovalReviewEmailDraft';

export const buildAiChatEmailToolArguments = ({
  proposal,
  draft,
}: {
  proposal: ProposedToolCall;
  draft: AiChatApprovalReviewEmailDraft;
}) => ({
  ...proposal.arguments,
  recipients: {
    to: serializeEmailRecipients(draft.to),
    cc: serializeEmailRecipients(draft.cc),
    bcc: serializeEmailRecipients(draft.bcc),
  },
  subject: draft.subject,
  body: parseCanonicalTipTapJsonDocument(draft.body),
});
