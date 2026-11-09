import { type ReplyContext } from '@/activities/emails/types/ReplyContext';
import { type AppReplyTarget } from '@/activities/emails/types/AppReplyTarget';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getAppReplyTarget = ({
  replyContext,
  messageChannelId,
  messageThreadId,
}: {
  replyContext: ReplyContext | null;
  messageChannelId: string | null;
  messageThreadId: string;
}): AppReplyTarget | null => {
  if (
    !isDefined(replyContext) ||
    replyContext.loading ||
    replyContext.connectedAccountProvider !== ConnectedAccountProvider.APP ||
    !isDefined(replyContext.connectedAccountHandle) ||
    !isDefined(messageChannelId)
  ) {
    return null;
  }

  return {
    connectedAccountId: replyContext.connectedAccountId,
    handle: replyContext.connectedAccountHandle,
    messageChannelId,
    messageThreadId,
  };
};
