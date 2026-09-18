import { useLingui } from '@lingui/react/macro';

import { AiChatListTabs } from '@/ai/components/AiChatListTabs';
import { AGENT_CHAT_INBOX_TAB } from '@/ai/constants/AgentChatInboxTab';
import { AGENT_CHAT_INBOX_TAB_ICONS } from '@/ai/constants/AgentChatInboxTabIcons';
import { AGENT_CHAT_INBOX_TAB_LABELS } from '@/ai/constants/AgentChatInboxTabLabels';
import { AGENT_CHAT_INBOX_TAB_ORDER } from '@/ai/constants/AgentChatInboxTabOrder';
import { type AgentChatInboxTab } from '@/ai/types/AgentChatInboxTab';

type AiChatInboxTabsProps = {
  componentInstanceId: string;
  countByInboxTab: Record<AgentChatInboxTab, number>;
  onChangeInboxTab: (inboxTab: AgentChatInboxTab) => void;
};

export const AiChatInboxTabs = ({
  componentInstanceId,
  countByInboxTab,
  onChangeInboxTab,
}: AiChatInboxTabsProps) => {
  const { t } = useLingui();

  const tabs = AGENT_CHAT_INBOX_TAB_ORDER.map((inboxTab) => {
    const count = countByInboxTab[inboxTab];

    return {
      id: inboxTab,
      title: t(AGENT_CHAT_INBOX_TAB_LABELS[inboxTab]),
      Icon: AGENT_CHAT_INBOX_TAB_ICONS[inboxTab],
      // All repeats the sum of the others, so its count says nothing new.
      pill:
        count > 0 && inboxTab !== AGENT_CHAT_INBOX_TAB.ALL
          ? String(count)
          : undefined,
    };
  });

  return (
    <AiChatListTabs
      componentInstanceId={componentInstanceId}
      tabs={tabs}
      onChangeTab={(tabId) => onChangeInboxTab(tabId as AgentChatInboxTab)}
    />
  );
};
