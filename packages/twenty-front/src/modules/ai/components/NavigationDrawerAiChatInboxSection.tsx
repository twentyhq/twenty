import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

import { AGENT_CHAT_THREAD_INBOX_STATE_ORDER } from '@/ai/constants/AgentChatThreadInboxStateOrder';
import { NavigationDrawerAiChatInboxStateItem } from '@/ai/components/NavigationDrawerAiChatInboxStateItem';
import { useAiChatInboxThreads } from '@/ai/hooks/useAiChatInboxThreads';
import { agentChatInboxStateTabState } from '@/ai/states/agentChatInboxStateTabState';
import { type AgentChatThreadInboxState } from '@/ai/types/AgentChatThreadInboxState';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { isAiChatInboxPath } from '~/utils/isAiChatPath';

const AI_CHAT_INBOX_NAVIGATION_SECTION_ID = 'AiChatInbox';

export const NavigationDrawerAiChatInboxSection = () => {
  const { t } = useLingui();
  const location = useLocation();
  const navigateApp = useNavigateApp();
  const [agentChatInboxStateTab, setAgentChatInboxStateTab] = useAtomState(
    agentChatInboxStateTabState,
  );
  const { threadsByInboxState } = useAiChatInboxThreads();

  const isOnInboxPage = isAiChatInboxPath(location.pathname);

  const openInboxState = (nextInboxState: AgentChatThreadInboxState) => {
    setAgentChatInboxStateTab(nextInboxState);
    navigateApp(AppPath.AiChatInbox, { threadId: null });
  };

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={AI_CHAT_INBOX_NAVIGATION_SECTION_ID}
      label={t`Inbox`}
    >
      {AGENT_CHAT_THREAD_INBOX_STATE_ORDER.map((state) => (
        <NavigationDrawerAiChatInboxStateItem
          key={state}
          inboxState={state}
          threads={threadsByInboxState[state]}
          active={isOnInboxPage && agentChatInboxStateTab === state}
          onClick={() => openInboxState(state)}
        />
      ))}
    </CollapsibleNavigationDrawerSection>
  );
};
