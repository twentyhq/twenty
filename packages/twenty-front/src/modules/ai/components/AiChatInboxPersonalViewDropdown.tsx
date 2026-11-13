import { useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  AGENT_CHAT_THREAD_PRESET_FILTER,
  type AgentChatThreadPresetFilter,
} from 'twenty-shared/ai';

import { AiChatInboxFilterDropdown } from '@/ai/components/AiChatInboxFilterDropdown';
import { AGENT_CHAT_OPEN_THREAD_PRESET_FILTERS } from '@/ai/constants/AgentChatOpenThreadPresetFilters';
import { AGENT_CHAT_THREAD_PRESET_FILTER_ICONS } from '@/ai/constants/AgentChatThreadPresetFilterIcons';
import { AGENT_CHAT_THREAD_PRESET_FILTER_LABELS } from '@/ai/constants/AgentChatThreadPresetFilterLabels';
import { useAgentChatOpenThreadsSummary } from '@/ai/hooks/useAgentChatOpenThreadsSummary';
import { agentChatSelectedThreadListSourceState } from '@/ai/states/agentChatSelectedThreadListSourceState';
import { isAgentChatOpenThreadPresetFilter } from '@/ai/utils/isAgentChatOpenThreadPresetFilter';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const AiChatInboxPersonalViewDropdown = () => {
  const { t } = useLingui();
  const navigate = useNavigateApp();
  const [
    agentChatSelectedThreadListSource,
    setAgentChatSelectedThreadListSource,
  ] = useAtomState(agentChatSelectedThreadListSourceState);
  const selectedPresetFilter =
    agentChatSelectedThreadListSource.type === 'presetFilter'
      ? agentChatSelectedThreadListSource.presetFilter
      : undefined;
  const {
    openThreadCount,
    needsInputThreadCount,
    mentionThreadCount,
    assignedToMeThreadCount,
    assignedThreadCount,
    unassignedThreadCount,
  } = useAgentChatOpenThreadsSummary();
  const { resetRecordSelection } = useResetRecordSelection();
  const countByPresetFilter: Partial<
    Record<AgentChatThreadPresetFilter, number>
  > = {
    [AGENT_CHAT_THREAD_PRESET_FILTER.OPEN]: openThreadCount,
    [AGENT_CHAT_THREAD_PRESET_FILTER.NEEDS_INPUT]: needsInputThreadCount,
    [AGENT_CHAT_THREAD_PRESET_FILTER.MENTIONS]: mentionThreadCount,
    [AGENT_CHAT_THREAD_PRESET_FILTER.ASSIGNED_TO_ME]: assignedToMeThreadCount,
    [AGENT_CHAT_THREAD_PRESET_FILTER.ASSIGNED_TO_ANYONE]: assignedThreadCount,
    [AGENT_CHAT_THREAD_PRESET_FILTER.UNASSIGNED]: unassignedThreadCount,
  };

  const handleSelect = (presetFilter: AgentChatThreadPresetFilter) => {
    resetRecordSelection();
    setAgentChatSelectedThreadListSource({
      type: 'presetFilter',
      presetFilter,
    });
    navigate(AppPath.AiChatInbox, { threadId: null });
  };

  return (
    <AiChatInboxFilterDropdown
      isFiltered={
        isDefined(selectedPresetFilter) &&
        selectedPresetFilter !== AGENT_CHAT_THREAD_PRESET_FILTER.OPEN &&
        isAgentChatOpenThreadPresetFilter(selectedPresetFilter)
      }
      options={AGENT_CHAT_OPEN_THREAD_PRESET_FILTERS.map((presetFilter) => ({
        key: presetFilter,
        label: t(AGENT_CHAT_THREAD_PRESET_FILTER_LABELS[presetFilter]),
        Icon: AGENT_CHAT_THREAD_PRESET_FILTER_ICONS[presetFilter],
        count: countByPresetFilter[presetFilter],
        isSelected: presetFilter === selectedPresetFilter,
        onSelect: () => handleSelect(presetFilter),
      }))}
    />
  );
};
