import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  AGENT_CHAT_THREAD_FILTER_STATUS,
  type AgentChatThreadFilterStatus,
} from 'twenty-shared/ai';

import { AGENT_CHAT_THREAD_FILTER_STATUS_ICONS } from '@/ai/constants/AgentChatThreadFilterStatusIcons';
import { AGENT_CHAT_THREAD_FILTER_STATUS_LABELS } from '@/ai/constants/AgentChatThreadFilterStatusLabels';
import { AI_CHAT_INBOX_INSTANCE_ID } from '@/ai/constants/AiChatInboxInstanceId';
import { agentChatSelectedThreadListSourceState } from '@/ai/states/agentChatSelectedThreadListSourceState';
import { isAgentChatOpenThreadFilterStatus } from '@/ai/utils/isAgentChatOpenThreadFilterStatus';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
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
  const [
    agentChatSelectedThreadListSource,
    setAgentChatSelectedThreadListSource,
  ] = useAtomState(agentChatSelectedThreadListSourceState);
  const { resetRecordSelection } = useResetRecordSelection(
    AI_CHAT_INBOX_INSTANCE_ID,
  );
  const isCurrentFilter =
    agentChatSelectedThreadListSource.type === 'presetFilter' &&
    (agentChatSelectedThreadListSource.presetFilter === filterStatus ||
      (filterStatus === AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE &&
        isAgentChatOpenThreadFilterStatus(
          agentChatSelectedThreadListSource.presetFilter,
        )));

  const handleClick = () => {
    resetRecordSelection();
    setAgentChatSelectedThreadListSource({
      type: 'presetFilter',
      presetFilter: filterStatus,
    });
    navigate(AppPath.AiChatInbox, { threadId: null });
  };

  return (
    <NavigationDrawerItem
      label={t(AGENT_CHAT_THREAD_FILTER_STATUS_LABELS[filterStatus])}
      secondaryLabel={isDefined(count) && count > 0 ? `${count}` : undefined}
      isUnread={isUnread}
      Icon={AGENT_CHAT_THREAD_FILTER_STATUS_ICONS[filterStatus]}
      active={isAiChatInboxPath(location.pathname) && isCurrentFilter}
      onClick={handleClick}
      triggerEvent="CLICK"
    />
  );
};
