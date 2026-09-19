import { useLingui } from '@lingui/react/macro';

import { AiChatListTabs } from '@/ai/components/AiChatListTabs';
import { AGENT_CHAT_CHANNEL_TAB } from '@/ai/constants/AgentChatChannelTab';
import { AGENT_CHAT_CHANNEL_TAB_LABELS } from '@/ai/constants/AgentChatChannelTabLabels';
import { AGENT_CHAT_CHANNEL_TAB_ORDER } from '@/ai/constants/AgentChatChannelTabOrder';
import { type AgentChatChannelTab } from '@/ai/types/AgentChatChannelTab';

type AiChatChannelTabsProps = {
  componentInstanceId: string;
  countByTab: Record<AgentChatChannelTab, number>;
  onChangeChannelTab: (channelTab: AgentChatChannelTab) => void;
};

export const AiChatChannelTabs = ({
  componentInstanceId,
  countByTab,
  onChangeChannelTab,
}: AiChatChannelTabsProps) => {
  const { t } = useLingui();

  const tabs = AGENT_CHAT_CHANNEL_TAB_ORDER.map((channelTab) => {
    const count = countByTab[channelTab];

    return {
      id: channelTab,
      title: t(AGENT_CHAT_CHANNEL_TAB_LABELS[channelTab]),
      // A zero reads as clutter on a tab that is already labelled, and done
      // only ever grows, so neither is worth a running total.
      pill:
        count > 0 && channelTab !== AGENT_CHAT_CHANNEL_TAB.DONE
          ? String(count)
          : undefined,
    };
  });

  return (
    <AiChatListTabs
      componentInstanceId={componentInstanceId}
      tabs={tabs}
      onChangeTab={(tabId) => onChangeChannelTab(tabId as AgentChatChannelTab)}
    />
  );
};
