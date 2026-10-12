import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';

import { NavigationDrawerAiChatTriageItem } from '@/ai/components/NavigationDrawerAiChatTriageItem';
import { useAgentChatOpenThreadsSummary } from '@/ai/hooks/useAgentChatOpenThreadsSummary';
import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { NavigationDrawerItemGroup } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemGroup';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isAiChatInboxPath } from '~/utils/isAiChatInboxPath';

const AI_CHAT_TRIAGE_NAVIGATION_SECTION_ID = 'AiChatTriage';

// Needs input, Mentions and Assigned narrow Open, so they hang under it
const OPEN_SUB_FILTER_STATUSES = [
  AGENT_CHAT_THREAD_FILTER_STATUS.NEEDS_INPUT,
  AGENT_CHAT_THREAD_FILTER_STATUS.MENTIONS,
  AGENT_CHAT_THREAD_FILTER_STATUS.ASSIGNED,
];

export const NavigationDrawerAiChatTriageSection = () => {
  const { t } = useLingui();
  const location = useLocation();
  const agentChatThreadFilterStatus = useAtomStateValue(
    agentChatThreadFilterStatusState,
  );
  const {
    openThreadCount,
    hasUnreadOpenThread,
    needsInputThreadCount,
    hasUnreadMentionThread,
    hasUnreadAssignedThread,
  } = useAgentChatOpenThreadsSummary();

  const getOpenSubItemState = (index: number) =>
    getNavigationSubItemLeftAdornment({
      index,
      arrayLength: OPEN_SUB_FILTER_STATUSES.length,
      selectedIndex: isAiChatInboxPath(location.pathname)
        ? OPEN_SUB_FILTER_STATUSES.findIndex(
            (filterStatus) => filterStatus === agentChatThreadFilterStatus,
          )
        : -1,
    });

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={AI_CHAT_TRIAGE_NAVIGATION_SECTION_ID}
      label={t`Triage`}
    >
      <NavigationDrawerItemGroup>
        <NavigationDrawerAiChatTriageItem
          filterStatus={AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE}
          count={openThreadCount}
          isUnread={hasUnreadOpenThread}
        />
        <NavigationDrawerAiChatTriageItem
          filterStatus={AGENT_CHAT_THREAD_FILTER_STATUS.NEEDS_INPUT}
          count={needsInputThreadCount}
          subItemState={getOpenSubItemState(0)}
        />
        <NavigationDrawerAiChatTriageItem
          filterStatus={AGENT_CHAT_THREAD_FILTER_STATUS.MENTIONS}
          isUnread={hasUnreadMentionThread}
          subItemState={getOpenSubItemState(1)}
        />
        <NavigationDrawerAiChatTriageItem
          filterStatus={AGENT_CHAT_THREAD_FILTER_STATUS.ASSIGNED}
          isUnread={hasUnreadAssignedThread}
          subItemState={getOpenSubItemState(2)}
        />
      </NavigationDrawerItemGroup>
      <NavigationDrawerAiChatTriageItem
        filterStatus={AGENT_CHAT_THREAD_FILTER_STATUS.SNOOZED}
      />
      <NavigationDrawerAiChatTriageItem
        filterStatus={AGENT_CHAT_THREAD_FILTER_STATUS.DONE}
      />
    </CollapsibleNavigationDrawerSection>
  );
};
