import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { NavigationDrawerAiChatTriageItem } from '@/ai/components/NavigationDrawerAiChatTriageItem';
import { useAgentChatOpenThreadsSummary } from '@/ai/hooks/useAgentChatOpenThreadsSummary';
import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { AI_CHAT_TRIAGE_NAVIGATION_SECTION_ID } from '@/ai/constants/AiChatTriageNavigationSectionId';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { NavigationDrawerItemGroup } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemGroup';
import { NavigationDrawerSectionSeeMoreItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionSeeMoreItem';
import { useNavigationSectionVisibleItems } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSectionVisibleItems';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isAiChatInboxPath } from '~/utils/isAiChatInboxPath';

const TRIAGE_FILTER_STATUSES = [
  AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE,
  AGENT_CHAT_THREAD_FILTER_STATUS.SNOOZED,
  AGENT_CHAT_THREAD_FILTER_STATUS.DONE,
];

// Needs input, Mentions and Assigned narrow Open, so they hang under it
const OPEN_SUB_FILTER_STATUSES = [
  AGENT_CHAT_THREAD_FILTER_STATUS.NEEDS_INPUT,
  AGENT_CHAT_THREAD_FILTER_STATUS.MENTIONS,
  AGENT_CHAT_THREAD_FILTER_STATUS.ASSIGNED,
];

type NavigationDrawerAiChatTriageSectionProps = {
  label?: string;
  rightIcon?: ReactNode;
  alwaysShowRightIcon?: boolean;
  visibleItemLimit?: number | null;
};

export const NavigationDrawerAiChatTriageSection = ({
  label,
  rightIcon,
  alwaysShowRightIcon,
  visibleItemLimit,
}: NavigationDrawerAiChatTriageSectionProps = {}) => {
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
    unreadMentionThreadCount,
    unreadAssignedThreadCount,
  } = useAgentChatOpenThreadsSummary();
  const {
    visibleItems: visibleFilterStatuses,
    isOverVisibleItemLimit,
    isShowingAllItems,
    toggleShowingAllItems,
  } = useNavigationSectionVisibleItems({
    navigationSectionId: AI_CHAT_TRIAGE_NAVIGATION_SECTION_ID,
    items: TRIAGE_FILTER_STATUSES,
    visibleItemLimit,
  });

  const isTriageShown = isAiChatInboxPath(location.pathname) && !isChannelShown;
  const isOpenExpanded =
    isTriageShown &&
    (agentChatThreadFilterStatus === AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE ||
      OPEN_SUB_FILTER_STATUSES.some(
        (filterStatus) => filterStatus === agentChatThreadFilterStatus,
      ));
  const countByOpenSubFilterStatus = {
    [AGENT_CHAT_THREAD_FILTER_STATUS.NEEDS_INPUT]: needsInputThreadCount,
    [AGENT_CHAT_THREAD_FILTER_STATUS.MENTIONS]: unreadMentionThreadCount,
    [AGENT_CHAT_THREAD_FILTER_STATUS.ASSIGNED]: unreadAssignedThreadCount,
  };
  const shownOpenSubFilterStatuses = OPEN_SUB_FILTER_STATUSES.filter(
    (filterStatus) =>
      isOpenExpanded || countByOpenSubFilterStatus[filterStatus] > 0,
  );
  const selectedOpenSubItemIndex = isTriageShown
    ? shownOpenSubFilterStatuses.findIndex(
        (filterStatus) => filterStatus === agentChatThreadFilterStatus,
      )
    : -1;
  const unreadByOpenSubFilterStatus = {
    [AGENT_CHAT_THREAD_FILTER_STATUS.NEEDS_INPUT]: false,
    [AGENT_CHAT_THREAD_FILTER_STATUS.MENTIONS]: hasUnreadMentionThread,
    [AGENT_CHAT_THREAD_FILTER_STATUS.ASSIGNED]: hasUnreadAssignedThread,
  };

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={AI_CHAT_TRIAGE_NAVIGATION_SECTION_ID}
      label={label ?? t`Inbox`}
      rightIcon={rightIcon}
      alwaysShowRightIcon={alwaysShowRightIcon}
    >
      {visibleFilterStatuses.map((filterStatus) =>
        filterStatus === AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE ? (
          <NavigationDrawerItemGroup key={filterStatus}>
            <NavigationDrawerAiChatTriageItem
              filterStatus={filterStatus}
              count={openThreadCount}
              isUnread={hasUnreadOpenThread}
            />
            {shownOpenSubFilterStatuses.map((openSubFilterStatus, index) => (
              <NavigationDrawerAiChatTriageItem
                key={openSubFilterStatus}
                filterStatus={openSubFilterStatus}
                count={countByOpenSubFilterStatus[openSubFilterStatus]}
                isCountUrgent={
                  openSubFilterStatus ===
                  AGENT_CHAT_THREAD_FILTER_STATUS.NEEDS_INPUT
                }
                isUnread={unreadByOpenSubFilterStatus[openSubFilterStatus]}
                subItemState={getNavigationSubItemLeftAdornment({
                  index,
                  arrayLength: shownOpenSubFilterStatuses.length,
                  selectedIndex: selectedOpenSubItemIndex,
                })}
              />
            ))}
          </NavigationDrawerItemGroup>
        ) : (
          <NavigationDrawerAiChatTriageItem
            key={filterStatus}
            filterStatus={filterStatus}
          />
        ),
      )}
      {isOverVisibleItemLimit && (
        <NavigationDrawerSectionSeeMoreItem
          isShowingAllItems={isShowingAllItems}
          onClick={toggleShowingAllItems}
        />
      )}
    </CollapsibleNavigationDrawerSection>
  );
};
