import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AGENT_CHAT_THREAD_INBOX_STATE_ICONS } from '@/ai/constants/AgentChatThreadInboxStateIcons';
import { AGENT_CHAT_THREAD_INBOX_STATE_LABELS } from '@/ai/constants/AgentChatThreadInboxStateLabels';
import { AGENT_CHAT_THREAD_INBOX_STATE_ORDER } from '@/ai/constants/AgentChatThreadInboxStateOrder';
import { type AgentChatThreadInboxState } from '@/ai/types/AgentChatThreadInboxState';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { TabListRoot } from '@/ui/layout/tab-list/components/TabListRoot';

const StyledContainer = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  flex-shrink: 0;
  padding-left: ${themeCssVariables.spacing[2]};
`;

type AiChatThreadInboxStateTabsProps = {
  componentInstanceId: string;
  countByInboxState: Record<AgentChatThreadInboxState, number>;
  onChangeInboxState: (inboxState: AgentChatThreadInboxState) => void;
};

export const AiChatThreadInboxStateTabs = ({
  componentInstanceId,
  countByInboxState,
  onChangeInboxState,
}: AiChatThreadInboxStateTabsProps) => {
  const { t } = useLingui();

  const tabs = AGENT_CHAT_THREAD_INBOX_STATE_ORDER.map((inboxState) => {
    const count = countByInboxState[inboxState];

    return {
      id: inboxState,
      title: t(AGENT_CHAT_THREAD_INBOX_STATE_LABELS[inboxState]),
      Icon: AGENT_CHAT_THREAD_INBOX_STATE_ICONS[inboxState],
      // A zero reads as clutter on a tab that is already labelled, so only a
      // waiting count is worth showing.
      pill: count > 0 ? String(count) : undefined,
    };
  });

  return (
    <TabListRoot componentInstanceId={componentInstanceId}>
      <StyledContainer>
        <TabList
          aria-label={t`Filter chats by state`}
          tabs={tabs}
          behaveAsLinks={false}
          componentInstanceId={componentInstanceId}
          onChangeTab={(tabId) =>
            onChangeInboxState(tabId as AgentChatThreadInboxState)
          }
        />
      </StyledContainer>
    </TabListRoot>
  );
};
