import { useLingui } from '@lingui/react/macro';

import { AiChatInboxFilterDropdown } from '@/ai/components/AiChatInboxFilterDropdown';
import { AGENT_CHAT_OPEN_THREAD_FILTER_STATUSES } from '@/ai/constants/AgentChatOpenThreadFilterStatuses';
import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { AGENT_CHAT_THREAD_FILTER_STATUS_ICONS } from '@/ai/constants/AgentChatThreadFilterStatusIcons';
import { AGENT_CHAT_THREAD_FILTER_STATUS_LABELS } from '@/ai/constants/AgentChatThreadFilterStatusLabels';
import { useAgentChatOpenThreadsSummary } from '@/ai/hooks/useAgentChatOpenThreadsSummary';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { type AgentChatThreadFilterStatus } from '@/ai/types/AgentChatThreadFilterStatus';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

export const AiChatInboxPersonalViewDropdown = () => {
  const { t } = useLingui();
  const [agentChatThreadFilterStatus, setAgentChatThreadFilterStatus] =
    useAtomState(agentChatThreadFilterStatusState);
  const { openThreadCount, needsInputThreadCount } =
    useAgentChatOpenThreadsSummary();
  const { resetRecordSelection } = useResetRecordSelection();
  const countByFilterStatus: Partial<
    Record<AgentChatThreadFilterStatus, number>
  > = {
    [AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE]: openThreadCount,
    [AGENT_CHAT_THREAD_FILTER_STATUS.NEEDS_INPUT]: needsInputThreadCount,
  };

  const handleSelect = (filterStatus: AgentChatThreadFilterStatus) => {
    resetRecordSelection();
    setAgentChatThreadFilterStatus(filterStatus);
  };

  return (
    <AiChatInboxFilterDropdown
      isFiltered={
        agentChatThreadFilterStatus !==
          AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE &&
        AGENT_CHAT_OPEN_THREAD_FILTER_STATUSES.includes(
          agentChatThreadFilterStatus,
        )
      }
      options={AGENT_CHAT_OPEN_THREAD_FILTER_STATUSES.map((filterStatus) => ({
        key: filterStatus,
        label: t(AGENT_CHAT_THREAD_FILTER_STATUS_LABELS[filterStatus]),
        Icon: AGENT_CHAT_THREAD_FILTER_STATUS_ICONS[filterStatus],
        count: countByFilterStatus[filterStatus],
        isSelected: filterStatus === agentChatThreadFilterStatus,
        onSelect: () => handleSelect(filterStatus),
      }))}
    />
  );
};
