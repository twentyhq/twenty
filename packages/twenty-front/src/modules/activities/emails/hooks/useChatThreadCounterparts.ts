import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { getChatThreadCounterparts } from '@/activities/emails/utils/getChatThreadCounterparts';
import { getOutgoingMessageIds } from '@/activities/emails/utils/getOutgoingMessageIds';
import { useMyMessageChannels } from '@/settings/accounts/hooks/useMyMessageChannels';

export const useChatThreadCounterparts = (
  messages: EmailThreadMessageWithSender[],
) => {
  const { channels, hasLoaded, loading } = useMyMessageChannels();

  if (!hasLoaded && loading) {
    return null;
  }

  return getChatThreadCounterparts({
    messages,
    outgoingMessageIds: getOutgoingMessageIds({
      messages,
      viewerMessageChannelIds: new Set(channels.map(({ id }) => id)),
    }),
  });
};
