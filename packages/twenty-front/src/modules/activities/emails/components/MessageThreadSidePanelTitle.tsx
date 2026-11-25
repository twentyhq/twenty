import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { ChatThreadSidePanelTitle } from '@/activities/emails/components/ChatThreadSidePanelTitle';
import { useMessageThreadChannel } from '@/activities/emails/hooks/useMessageThreadChannel';
import { isChatTimelineThreadChannel } from '@/activities/emails/utils/isChatTimelineThreadChannel';

type MessageThreadSidePanelTitleProps = {
  messageThreadId: string;
  emailThreadTitle: ReactNode;
};

export const MessageThreadSidePanelTitle = ({
  messageThreadId,
  emailThreadTitle,
}: MessageThreadSidePanelTitleProps) => {
  const { messageThreadChannel, messageThreadChannelLoading } =
    useMessageThreadChannel(messageThreadId);

  if (messageThreadChannelLoading) {
    return null;
  }

  if (
    isDefined(messageThreadChannel) &&
    isChatTimelineThreadChannel(messageThreadChannel)
  ) {
    return (
      <ChatThreadSidePanelTitle
        messageThreadId={messageThreadId}
        channel={messageThreadChannel}
      />
    );
  }

  return emailThreadTitle;
};
