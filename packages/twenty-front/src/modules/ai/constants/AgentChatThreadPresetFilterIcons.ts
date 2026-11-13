import {
  type IconComponent,
  IconAt,
  IconCircleCheck,
  IconCircleDashed,
  IconHandClick,
  IconUserCircle,
  IconUserOff,
  IconUsers,
  IconZzz,
} from 'twenty-ui/icon';
import { type AgentChatThreadPresetFilter } from 'twenty-shared/ai';

export const AGENT_CHAT_THREAD_PRESET_FILTER_ICONS: Record<
  AgentChatThreadPresetFilter,
  IconComponent
> = {
  active: IconCircleDashed,
  needsInput: IconHandClick,
  mentions: IconAt,
  assigned: IconUserCircle,
  assignedToAnyone: IconUsers,
  unassigned: IconUserOff,
  snoozed: IconZzz,
  done: IconCircleCheck,
};
