import { useLingui } from '@lingui/react/macro';

import { AiChatThreadListGroups } from '@/ai/components/AiChatThreadListGroups';
import { AGENT_CHAT_CHANNEL_TAB } from '@/ai/constants/AgentChatChannelTab';
import { useAiChatChannelThreads } from '@/ai/hooks/useAiChatChannelThreads';
import { type AgentChatChannelTab } from '@/ai/types/AgentChatChannelTab';

type AiChatChannelThreadListProps = {
  channelId: string;
  channelTab: AgentChatChannelTab;
};

export const AiChatChannelThreadList = ({
  channelId,
  channelTab,
}: AiChatChannelThreadListProps) => {
  const { t } = useLingui();
  const { threadsByTab } = useAiChatChannelThreads(channelId);

  const emptyLabel = {
    [AGENT_CHAT_CHANNEL_TAB.UNASSIGNED]: t`Nothing waiting to be picked up`,
    [AGENT_CHAT_CHANNEL_TAB.ASSIGNED]: t`Nobody is on a chat here yet`,
    [AGENT_CHAT_CHANNEL_TAB.SNOOZED]: t`Nothing snoozed here`,
    [AGENT_CHAT_CHANNEL_TAB.DONE]: t`Nothing marked done here`,
  }[channelTab];

  return (
    <AiChatThreadListGroups
      threads={threadsByTab[channelTab]}
      emptyLabel={emptyLabel}
    />
  );
};
