import { useMemo } from 'react';

import { useEmailThread } from '@/activities/emails/hooks/useEmailThread';
import {
  type ReplyContext,
  type ReplyContextReady,
} from '@/activities/emails/types/ReplyContext';
import { getReplyToRecipients } from '@/activities/emails/utils/getReplyToRecipients';
import { isDefined } from 'twenty-shared/utils';

export type { ReplyContext, ReplyContextReady };

export const useReplyContext = (
  threadId: string | null,
): ReplyContext | null => {
  const {
    messages,
    connectedAccountId,
    connectedAccountHandle,
    connectedAccountProvider,
    messageChannelLoading,
    threadLoading,
  } = useEmailThread(threadId);

  return useMemo(() => {
    if (
      !isDefined(connectedAccountId) ||
      !isDefined(connectedAccountProvider)
    ) {
      if (messageChannelLoading || threadLoading) {
        return { loading: true };
      }

      return null;
    }

    const sentMessages = messages.filter((message) => !message.isDraft);
    const lastSentMessage = sentMessages[sentMessages.length - 1];

    if (!isDefined(lastSentMessage)) {
      if (messages.length === 0) {
        return null;
      }

      return {
        loading: false,
        to: '',
        subject: '',
        inReplyTo: '',
        connectedAccountId,
        connectedAccountProvider,
      };
    }

    const replyTo = getReplyToRecipients({
      message: lastSentMessage,
      connectedAccountHandle,
    });

    const rawSubject = lastSentMessage.subject ?? '';
    const subject = rawSubject.startsWith('Re: ')
      ? rawSubject
      : `Re: ${rawSubject}`;

    return {
      loading: false,
      to: replyTo,
      subject,
      inReplyTo: lastSentMessage.headerMessageId ?? '',
      connectedAccountId,
      connectedAccountProvider,
    };
  }, [
    messages,
    connectedAccountId,
    connectedAccountHandle,
    connectedAccountProvider,
    messageChannelLoading,
    threadLoading,
  ]);
};
