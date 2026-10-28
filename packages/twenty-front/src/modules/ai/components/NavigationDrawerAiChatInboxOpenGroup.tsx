import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { NavigationDrawerAiChatInboxItem } from '@/ai/components/NavigationDrawerAiChatInboxItem';
import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { useAgentChatOpenThreadsSummary } from '@/ai/hooks/useAgentChatOpenThreadsSummary';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { NavigationDrawerItemGroup } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemGroup';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isAiChatInboxPath } from '~/utils/isAiChatInboxPath';

const OPEN_SUB_FILTER_STATUSES = [
  AGENT_CHAT_THREAD_FILTER_STATUS.NEEDS_INPUT,
  AGENT_CHAT_THREAD_FILTER_STATUS.MENTIONS,
  AGENT_CHAT_THREAD_FILTER_STATUS.ASSIGNED,
];

export const NavigationDrawerAiChatInboxOpenGroup = () => {
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

  const isInboxShown = isAiChatInboxPath(location.pathname) && !isChannelShown;
  const isOpenExpanded =
    isInboxShown &&
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
  const selectedOpenSubItemIndex = isInboxShown
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
    <NavigationDrawerItemGroup>
      <NavigationDrawerAiChatInboxItem
        filterStatus={AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE}
        count={openThreadCount}
        isUnread={hasUnreadOpenThread}
      />
      {shownOpenSubFilterStatuses.map((openSubFilterStatus, index) => (
        <NavigationDrawerAiChatInboxItem
          key={openSubFilterStatus}
          filterStatus={openSubFilterStatus}
          count={countByOpenSubFilterStatus[openSubFilterStatus]}
          isCountUrgent={
            openSubFilterStatus === AGENT_CHAT_THREAD_FILTER_STATUS.NEEDS_INPUT
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
  );
};
