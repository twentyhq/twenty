import { isNonEmptyString } from '@sniptt/guards';
import { useMemo } from 'react';

import { useEmailThread } from '@/activities/emails/hooks/useEmailThread';
import { formatEmailRecipient } from '@/activities/emails/recipients/utils/formatEmailRecipient';
import {
  type ReplyContext,
  type ReplyContextReady,
} from '@/activities/emails/types/ReplyContext';
import { isDefined } from 'twenty-shared/utils';

export type { ReplyContext, ReplyContextReady };

export const useReplyContext = (
  threadId: string | null,
): ReplyContext | null => {
  const {
    messages,
    connectedAccountId,
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

    const senderHandle = lastSentMessage.sender?.handle ?? '';
    const replyTo = isNonEmptyString(senderHandle)
      ? formatEmailRecipient({
          address: senderHandle,
          displayName: lastSentMessage.sender?.displayName,
        })
      : '';

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
    connectedAccountProvider,
    messageChannelLoading,
    threadLoading,
  ]);
};
