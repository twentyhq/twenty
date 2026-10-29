import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_OPEN_THREAD_FILTER_STATUSES } from '@/ai/constants/AgentChatOpenThreadFilterStatuses';
import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { AGENT_CHAT_THREAD_FILTER_STATUS_ICONS } from '@/ai/constants/AgentChatThreadFilterStatusIcons';
import { AGENT_CHAT_THREAD_FILTER_STATUS_LABELS } from '@/ai/constants/AgentChatThreadFilterStatusLabels';
import { agentChatChannelViewState } from '@/ai/states/agentChatChannelViewState';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { type AgentChatThreadFilterStatus } from '@/ai/types/AgentChatThreadFilterStatus';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { isAiChatInboxPath } from '~/utils/isAiChatInboxPath';

type NavigationDrawerAiChatTriageItemProps = {
  filterStatus: AgentChatThreadFilterStatus;
  count?: number;
  isUnread?: boolean;
};

export const NavigationDrawerAiChatTriageItem = ({
  filterStatus,
  count,
  isUnread,
}: NavigationDrawerAiChatTriageItemProps) => {
  const { t } = useLingui();
  const location = useLocation();
  const navigate = useNavigateApp();
  const [agentChatThreadFilterStatus, setAgentChatThreadFilterStatus] =
    useAtomState(agentChatThreadFilterStatusState);
  const setAgentChatChannelView = useSetAtomState(agentChatChannelViewState);
  const isChannelShown = isDefined(
    useAtomStateValue(agentChatShownChannelViewSelector),
  );
  const isCurrentFilter =
    agentChatThreadFilterStatus === filterStatus ||
    (filterStatus === AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE &&
      AGENT_CHAT_OPEN_THREAD_FILTER_STATUSES.includes(
        agentChatThreadFilterStatus,
      ));

  const handleClick = () => {
    setAgentChatThreadFilterStatus(filterStatus);
    setAgentChatChannelView(null);
    navigate(AppPath.AiChatInbox, { threadId: null });
  };

  return (
    <NavigationDrawerItem
      label={t(AGENT_CHAT_THREAD_FILTER_STATUS_LABELS[filterStatus])}
      secondaryLabel={isDefined(count) && count > 0 ? `${count}` : undefined}
      isUnread={isUnread}
      Icon={AGENT_CHAT_THREAD_FILTER_STATUS_ICONS[filterStatus]}
      active={
        isAiChatInboxPath(location.pathname) &&
        !isChannelShown &&
        isCurrentFilter
      }
      onClick={handleClick}
      triggerEvent="CLICK"
    />
  );
};
