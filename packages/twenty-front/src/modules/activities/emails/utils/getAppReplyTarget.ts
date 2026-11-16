import { type ReplyContextReady } from '@/activities/emails/types/ReplyContext';
import { type AppReplyTarget } from '@/activities/emails/types/AppReplyTarget';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getAppReplyTarget = ({
  replyContext,
  messageChannelId,
  messageThreadId,
}: {
  replyContext:
    | { loading: true }
    | Pick<
        ReplyContextReady,
        | 'loading'
        | 'connectedAccountId'
        | 'connectedAccountProvider'
        | 'messageChannelHandle'
      >
    | null;
  messageChannelId: string | null;
  messageThreadId: string;
}): AppReplyTarget | null => {
  if (
    !isDefined(replyContext) ||
    replyContext.loading ||
    replyContext.connectedAccountProvider !== ConnectedAccountProvider.APP ||
    !isDefined(replyContext.messageChannelHandle) ||
    !isDefined(messageChannelId)
  ) {
    return null;
  }

  return {
    connectedAccountId: replyContext.connectedAccountId,
    handle: replyContext.messageChannelHandle,
    messageChannelId,
    messageThreadId,
  };
};
