import { useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  AGENT_CHAT_THREAD_PRESET_FILTER,
  type AgentChatThreadPresetFilter,
} from 'twenty-shared/ai';

import { InboxFilterDropdown } from '@/ai/components/InboxFilterDropdown';
import { INBOX_OPEN_THREAD_PRESET_FILTERS } from '@/ai/constants/InboxOpenThreadPresetFilters';
import { INBOX_THREAD_PRESET_FILTER_ICONS } from '@/ai/constants/InboxThreadPresetFilterIcons';
import { INBOX_THREAD_PRESET_FILTER_LABELS } from '@/ai/constants/InboxThreadPresetFilterLabels';
import { useInboxOpenThreadsSummary } from '@/ai/hooks/useInboxOpenThreadsSummary';
import { inboxSelectedThreadListSourceState } from '@/ai/states/inboxSelectedThreadListSourceState';
import { isInboxOpenThreadPresetFilter } from '@/ai/utils/isInboxOpenThreadPresetFilter';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const InboxPersonalViewDropdown = () => {
  const { t } = useLingui();
  const navigate = useNavigateApp();
  const [inboxSelectedThreadListSource, setInboxSelectedThreadListSource] =
    useAtomState(inboxSelectedThreadListSourceState);
  const selectedPresetFilter =
    inboxSelectedThreadListSource.type === 'presetFilter'
      ? inboxSelectedThreadListSource.presetFilter
      : undefined;
  const {
    openThreadCount,
    needsInputThreadCount,
    mentionThreadCount,
    assignedToMeThreadCount,
    assignedThreadCount,
    unassignedThreadCount,
  } = useInboxOpenThreadsSummary();
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
    setInboxSelectedThreadListSource({
      type: 'presetFilter',
      presetFilter,
    });
    navigate(AppPath.AiChatInbox, { threadId: null });
  };

  return (
    <InboxFilterDropdown
      isFiltered={
        isDefined(selectedPresetFilter) &&
        selectedPresetFilter !== AGENT_CHAT_THREAD_PRESET_FILTER.OPEN &&
        isInboxOpenThreadPresetFilter(selectedPresetFilter)
      }
      options={INBOX_OPEN_THREAD_PRESET_FILTERS.map((presetFilter) => ({
        key: presetFilter,
        label: t(INBOX_THREAD_PRESET_FILTER_LABELS[presetFilter]),
        Icon: INBOX_THREAD_PRESET_FILTER_ICONS[presetFilter],
        count: countByPresetFilter[presetFilter],
        isSelected: presetFilter === selectedPresetFilter,
        onSelect: () => handleSelect(presetFilter),
      }))}
    />
  );
};
