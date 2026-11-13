import { msg } from '@lingui/core/macro';
import { type MessageDescriptor } from '@lingui/core';
import { type AgentChatThreadPresetFilter } from 'twenty-shared/ai';

export const AGENT_CHAT_THREAD_PRESET_FILTER_LABELS: Record<
  AgentChatThreadPresetFilter,
  MessageDescriptor
> = {
  active: msg`Open`,
  needsInput: msg`Needs input`,
  mentions: msg`Mentions`,
  assigned: msg`Assigned to me`,
  assignedToAnyone: msg`Assigned`,
  unassigned: msg`Unassigned`,
  snoozed: msg`Snoozed`,
  done: msg`Done`,
};
