import { MessageChannelLogo } from '@/activities/emails/components/MessageChannelLogo';
import { useChatThreadTitle } from '@/activities/emails/hooks/useChatThreadTitle';
import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';
import { type TimelineThreadChannel } from '~/generated/graphql';

type ChatThreadSidePanelTitleProps = {
  messageThreadId: string;
  channel: TimelineThreadChannel;
};

export const ChatThreadSidePanelTitle = ({
  messageThreadId,
  channel,
}: ChatThreadSidePanelTitleProps) => {
  const title = useChatThreadTitle(messageThreadId);

  return (
    <HeaderIdentifier
      icon={<MessageChannelLogo channel={channel} />}
      title={title ?? ''}
    />
  );
};
