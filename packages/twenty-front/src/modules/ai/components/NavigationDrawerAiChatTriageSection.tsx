import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { NavigationDrawerAiChatTriageItem } from '@/ai/components/NavigationDrawerAiChatTriageItem';
import { useAgentChatOpenThreadsSummary } from '@/ai/hooks/useAgentChatOpenThreadsSummary';
import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
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
  const isChannelShown = isDefined(
    useAtomStateValue(agentChatShownChannelViewSelector),
  );
  const {
    openThreadCount,
    hasUnreadOpenThread,
    needsInputThreadCount,
    hasUnreadMentionThread,
    hasUnreadAssignedThread,
  } = useAgentChatOpenThreadsSummary();

  const isTriageShown = isAiChatInboxPath(location.pathname) && !isChannelShown;
  const selectedOpenSubItemIndex = isTriageShown
    ? OPEN_SUB_FILTER_STATUSES.findIndex(
        (filterStatus) => filterStatus === agentChatThreadFilterStatus,
      )
    : -1;
  const isOpenExpanded =
    isTriageShown &&
    (agentChatThreadFilterStatus === AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE ||
      selectedOpenSubItemIndex >= 0);

  const getOpenSubItemState = (index: number) =>
    getNavigationSubItemLeftAdornment({
      index,
      arrayLength: OPEN_SUB_FILTER_STATUSES.length,
      selectedIndex: selectedOpenSubItemIndex,
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
        {isOpenExpanded && (
          <>
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
          </>
        )}
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
