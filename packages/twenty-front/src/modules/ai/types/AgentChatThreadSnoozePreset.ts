import { type MessageDescriptor } from '@lingui/core';

export type AgentChatThreadSnoozePresetKey =
  | 'oneHour'
  | 'threeHours'
  | 'tomorrow'
  | 'nextWeek';

export type AgentChatThreadSnoozePreset = {
  key: AgentChatThreadSnoozePresetKey;
  label: MessageDescriptor;
};
