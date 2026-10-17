import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_THREAD_FILTER_STATUS_ICONS } from '@/ai/constants/AgentChatThreadFilterStatusIcons';
import { AGENT_CHAT_THREAD_FILTER_STATUS_LABELS } from '@/ai/constants/AgentChatThreadFilterStatusLabels';
import { agentChatChannelViewState } from '@/ai/states/agentChatChannelViewState';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { type AgentChatThreadFilterStatus } from '@/ai/types/AgentChatThreadFilterStatus';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { type NavigationDrawerSubItemState } from '@/ui/navigation/navigation-drawer/types/NavigationDrawerSubItemState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { isAiChatInboxPath } from '~/utils/isAiChatInboxPath';

type NavigationDrawerAiChatTriageItemProps = {
  filterStatus: AgentChatThreadFilterStatus;
  count?: number;
  isUnread?: boolean;
  subItemState?: NavigationDrawerSubItemState;
};

export const NavigationDrawerAiChatTriageItem = ({
  filterStatus,
  count,
  isUnread,
  subItemState,
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
        agentChatThreadFilterStatus === filterStatus
      }
      indentationLevel={isDefined(subItemState) ? 2 : undefined}
      subItemState={subItemState}
      onClick={handleClick}
      triggerEvent="CLICK"
    />
  );
};
