import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Badge } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

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

const StyledCount = styled.span`
  display: flex;
  padding-right: ${themeCssVariables.spacing['1.5']};
`;

type NavigationDrawerAiChatInboxItemProps = {
  filterStatus: AgentChatThreadFilterStatus;
  count?: number;
  isCountUrgent?: boolean;
  isUnread?: boolean;
};

export const NavigationDrawerAiChatInboxItem = ({
  filterStatus,
  count,
  isCountUrgent = false,
  isUnread,
}: NavigationDrawerAiChatInboxItemProps) => {
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
  const hasCount = isDefined(count) && count > 0;

  return (
    <NavigationDrawerItem
      label={t(AGENT_CHAT_THREAD_FILTER_STATUS_LABELS[filterStatus])}
      isUnread={isUnread}
      Icon={AGENT_CHAT_THREAD_FILTER_STATUS_ICONS[filterStatus]}
      active={
        isAiChatInboxPath(location.pathname) &&
        !isChannelShown &&
        agentChatThreadFilterStatus === filterStatus
      }
      onClick={handleClick}
      triggerEvent="CLICK"
      rightOptions={
        hasCount ? (
          <StyledCount>
            <Badge color={isCountUrgent ? 'danger' : 'tertiary'}>{count}</Badge>
          </StyledCount>
        ) : undefined
      }
      alwaysShowRightOptions={hasCount}
    />
  );
};
