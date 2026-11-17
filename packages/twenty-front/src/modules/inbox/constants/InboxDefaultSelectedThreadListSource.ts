import { AGENT_CHAT_THREAD_PRESET_FILTER } from 'twenty-shared/ai';

import { type InboxSelectedThreadListSource } from '@/inbox/types/InboxSelectedThreadListSource';

export const INBOX_DEFAULT_SELECTED_THREAD_LIST_SOURCE: InboxSelectedThreadListSource =
  {
    type: 'presetFilter',
    presetFilter: AGENT_CHAT_THREAD_PRESET_FILTER.OPEN,
  };
