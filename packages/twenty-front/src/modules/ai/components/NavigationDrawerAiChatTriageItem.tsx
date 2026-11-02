import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { AGENT_CHAT_THREAD_FILTER_STATUS_ICONS } from '@/ai/constants/AgentChatThreadFilterStatusIcons';
import { AGENT_CHAT_THREAD_FILTER_STATUS_LABELS } from '@/ai/constants/AgentChatThreadFilterStatusLabels';
import { AI_CHAT_INBOX_INSTANCE_ID } from '@/ai/constants/AiChatInboxInstanceId';
import { agentChatChannelViewState } from '@/ai/states/agentChatChannelViewState';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { type AgentChatThreadFilterStatus } from '@/ai/types/AgentChatThreadFilterStatus';
import { isAgentChatOpenThreadFilterStatus } from '@/ai/utils/isAgentChatOpenThreadFilterStatus';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
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
  const { resetRecordSelection } = useResetRecordSelection(
    AI_CHAT_INBOX_INSTANCE_ID,
  );
  const isCurrentFilter =
    agentChatThreadFilterStatus === filterStatus ||
    (filterStatus === AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE &&
      isAgentChatOpenThreadFilterStatus(agentChatThreadFilterStatus));

  const handleClick = () => {
    resetRecordSelection();
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
