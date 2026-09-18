import { msg } from '@lingui/core/macro';

import { type AgentChatThreadSnoozePreset } from '@/ai/types/AgentChatThreadSnoozePreset';

export const AGENT_CHAT_THREAD_SNOOZE_PRESETS: AgentChatThreadSnoozePreset[] = [
  { key: 'oneHour', label: msg`In an hour` },
  { key: 'threeHours', label: msg`In three hours` },
  { key: 'tomorrow', label: msg`Tomorrow morning` },
  { key: 'nextWeek', label: msg`Next week` },
];
