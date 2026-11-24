import { ViewPresetFilter } from 'twenty-shared/types';

export const AGENT_CHAT_CHANNEL_VIEW_DEFINITIONS = [
  {
    name: 'Open',
    icon: 'IconCircleDashed',
    presetFilter: ViewPresetFilter.INBOX_CHANNEL_OPEN,
  },
  {
    name: 'Snoozed',
    icon: 'IconZzz',
    presetFilter: ViewPresetFilter.INBOX_CHANNEL_SNOOZED,
  },
  {
    name: 'Done',
    icon: 'IconCircleCheck',
    presetFilter: ViewPresetFilter.INBOX_CHANNEL_DONE,
  },
] as const;
