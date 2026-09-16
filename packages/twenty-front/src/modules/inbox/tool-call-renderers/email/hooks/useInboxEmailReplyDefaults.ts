import { useEmailThread } from '@/activities/emails/hooks/useEmailThread';
import { getReplyDefaultsFromMessages } from '@/activities/emails/utils/getReplyDefaultsFromMessages';
import { useInboxReplyAccount } from '@/inbox/tool-call-renderers/email/hooks/useInboxReplyAccount';
import { type InboxEmailComposerPrefill } from '@/inbox/tool-call-renderers/email/utils/getEmailComposerPrefillFromToolCall';

export type InboxEmailReplyDefaults = Partial<
  Pick<
    InboxEmailComposerPrefill,
    'to' | 'subject' | 'connectedAccountId' | 'inReplyTo'
  >
>;

// What a reply on this item should look like before anyone has typed: the
// thread says who and what, the queue and the viewer's mailboxes say from
// where. An item about nothing in particular still resolves a sender.
export const useInboxEmailReplyDefaults = ({
  messageThreadId,
  queueId,
}: {
  messageThreadId: string | null;
  queueId: string | null | undefined;
}): InboxEmailReplyDefaults => {
  const { messages, lastMessageChannelId } = useEmailThread(messageThreadId);
  const { replyAccount } = useInboxReplyAccount({
    queueId,
    receivingMessageChannelId: lastMessageChannelId,
  });

  const threadReplyDefaults = getReplyDefaultsFromMessages({
    messages,
    connectedAccountHandle: replyAccount?.connectedAccountHandle,
  });

  return {
    to: threadReplyDefaults?.to,
    subject: threadReplyDefaults?.subject,
    inReplyTo: threadReplyDefaults?.inReplyTo,
    connectedAccountId: replyAccount?.connectedAccountId,
  };
};
