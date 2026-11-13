import { type AgentChatThreadPresetFilter } from 'twenty-shared/ai';

import { INBOX_OPEN_THREAD_PRESET_FILTERS } from '@/ai/constants/AgentChatOpenThreadPresetFilters';

export const isInboxOpenThreadPresetFilter = (
  presetFilter: AgentChatThreadPresetFilter,
) => INBOX_OPEN_THREAD_PRESET_FILTERS.includes(presetFilter);
