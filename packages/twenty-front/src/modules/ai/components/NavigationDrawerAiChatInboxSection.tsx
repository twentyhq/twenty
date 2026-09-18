import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

import { AGENT_CHAT_THREAD_INBOX_STATE } from '@/ai/constants/AgentChatThreadInboxState';
import {
  AGENT_CHAT_THREAD_INBOX_STATE_ICONS,
  AGENT_CHAT_THREAD_INBOX_STATE_LABELS,
  AGENT_CHAT_THREAD_INBOX_STATE_ORDER,
} from '@/ai/constants/AgentChatThreadInboxStateLabels';
import { useAiChatInboxThreads } from '@/ai/hooks/useAiChatInboxThreads';
import { agentChatInboxStateTabState } from '@/ai/states/agentChatInboxStateTabState';
import { type AgentChatThreadInboxState } from '@/ai/types/AgentChatThreadInboxState';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { isAiChatInboxPath } from '~/utils/isAiChatPath';

const AI_CHAT_INBOX_NAVIGATION_SECTION_ID = 'AiChatInbox';

export const NavigationDrawerAiChatInboxSection = () => {
  const { t } = useLingui();
  const location = useLocation();
  const navigateApp = useNavigateApp();
  const [inboxState, setInboxState] = useAtomState(agentChatInboxStateTabState);
  const { threadsByInboxState } = useAiChatInboxThreads();

  const isOnInboxPage = isAiChatInboxPath(location.pathname);

  const openInboxState = (nextInboxState: AgentChatThreadInboxState) => {
    setInboxState(nextInboxState);
    navigateApp(AppPath.AiChatInbox, { threadId: null });
  };

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={AI_CHAT_INBOX_NAVIGATION_SECTION_ID}
      label={t`Inbox`}
    >
      {AGENT_CHAT_THREAD_INBOX_STATE_ORDER.map((state) => {
        const count = threadsByInboxState[state].length;
        // Done only grows once a workspace is in use, so its running total
        // says nothing worth carrying in the sidebar.
        const showCount =
          count > 0 && state !== AGENT_CHAT_THREAD_INBOX_STATE.DONE;

        return (
          <NavigationDrawerItem
            key={state}
            Icon={AGENT_CHAT_THREAD_INBOX_STATE_ICONS[state]}
            label={t(AGENT_CHAT_THREAD_INBOX_STATE_LABELS[state])}
            active={isOnInboxPage && inboxState === state}
            secondaryLabel={showCount ? String(count) : undefined}
            onClick={() => openInboxState(state)}
          />
        );
      })}
    </CollapsibleNavigationDrawerSection>
  );
};
