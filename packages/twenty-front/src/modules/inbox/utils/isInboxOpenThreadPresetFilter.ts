import { type AgentChatThreadPresetFilter } from 'twenty-shared/ai';

import { INBOX_OPEN_THREAD_PRESET_FILTERS } from '@/inbox/constants/InboxOpenThreadPresetFilters';

export const isInboxOpenThreadPresetFilter = (
  presetFilter: AgentChatThreadPresetFilter,
) => INBOX_OPEN_THREAD_PRESET_FILTERS.includes(presetFilter);
