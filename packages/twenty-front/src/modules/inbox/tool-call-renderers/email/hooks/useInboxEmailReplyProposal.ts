import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';

import { type InboxItemToolCallDraft } from '@/inbox/contexts/InboxItemPlanContext';
import { useInboxItemMessageThreadId } from '@/inbox/hooks/useInboxItemMessageThreadId';
import { EMAIL_TOOL_CALL_INPUT_SCHEMA } from '@/inbox/tool-call-renderers/email/constants/EmailToolCallInputSchema';
import { SEND_EMAIL_TOOL_NAME } from '@/inbox/tool-call-renderers/email/constants/SendEmailToolName';
import { useInboxEmailReplyDefaults } from '@/inbox/tool-call-renderers/email/hooks/useInboxEmailReplyDefaults';
import { buildEmailToolCallInput } from '@/inbox/tool-call-renderers/email/utils/buildEmailToolCallInput';
import { type InboxItem } from '~/generated/graphql';

// A reply typed by hand lands as a proposed send_email call, like an agent's
// would, so it is featured, edited, run and audited by the same path.
export const useInboxEmailReplyProposal = (
  inboxItem: InboxItem,
): InboxItemToolCallDraft | null => {
  const { t } = useLingui();
  const messageThreadId = useInboxItemMessageThreadId(inboxItem);
  const replyDefaults = useInboxEmailReplyDefaults({
    messageThreadId,
    queueId: inboxItem.queueId,
  });

  const to = replyDefaults.to ?? '';

  return {
    toolName: SEND_EMAIL_TOOL_NAME,
    label: isNonEmptyString(to) ? t`Reply to ${to}` : t`Reply`,
    icon: 'IconMail',
    inputSchema: EMAIL_TOOL_CALL_INPUT_SCHEMA,
    proposedInput: buildEmailToolCallInput({
      to,
      cc: '',
      bcc: '',
      subject: replyDefaults.subject ?? '',
      body: '',
      connectedAccountId: replyDefaults.connectedAccountId,
      inReplyTo: replyDefaults.inReplyTo,
    }),
  };
};
