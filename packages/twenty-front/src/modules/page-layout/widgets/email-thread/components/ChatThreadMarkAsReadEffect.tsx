import { useEffect } from 'react';

import { useMarkAppChannelThreadAsRead } from '@/activities/emails/hooks/useMarkAppChannelThreadAsRead';

type ChatThreadMarkAsReadEffectProps = {
  messageChannelId: string;
  messageThreadId: string;
};

export const ChatThreadMarkAsReadEffect = ({
  messageChannelId,
  messageThreadId,
}: ChatThreadMarkAsReadEffectProps) => {
  const { markAppChannelThreadAsRead } = useMarkAppChannelThreadAsRead();

  // Threads open from many places (timeline, record pages, links), so the opened widget is the one place that sees them all.
  useEffect(() => {
    markAppChannelThreadAsRead({ messageChannelId, messageThreadId });
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [messageChannelId, messageThreadId]);

  return <></>;
};
