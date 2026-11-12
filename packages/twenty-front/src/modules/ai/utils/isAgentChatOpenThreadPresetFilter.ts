import { type AgentChatThreadPresetFilter } from 'twenty-shared/ai';

import { AGENT_CHAT_OPEN_THREAD_PRESET_FILTERS } from '@/ai/constants/AgentChatOpenThreadPresetFilters';

export const isAgentChatOpenThreadPresetFilter = (
  presetFilter: AgentChatThreadPresetFilter,
) => AGENT_CHAT_OPEN_THREAD_PRESET_FILTERS.includes(presetFilter);
