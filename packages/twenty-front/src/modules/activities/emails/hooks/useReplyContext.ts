import { useMemo } from 'react';

import { useEmailThread } from '@/activities/emails/hooks/useEmailThread';
import {
  type ReplyContext,
  type ReplyContextReady,
} from '@/activities/emails/types/ReplyContext';
import { getReplyDefaultsFromMessages } from '@/activities/emails/utils/getReplyDefaultsFromMessages';
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

    const replyDefaults = getReplyDefaultsFromMessages({
      messages,
      connectedAccountHandle,
    });

    if (!isDefined(replyDefaults)) {
      return null;
    }

    return {
      loading: false,
      ...replyDefaults,
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
