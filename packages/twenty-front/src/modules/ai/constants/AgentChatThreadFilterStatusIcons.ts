import {
  type IconComponent,
  IconAt,
  IconCheck,
  IconCircleDashed,
  IconHandClick,
  IconUserCircle,
  IconUserOff,
  IconUsers,
  IconZzz,
} from 'twenty-ui/icon';

import { type AgentChatThreadFilterStatus } from '@/ai/types/AgentChatThreadFilterStatus';

export const AGENT_CHAT_THREAD_FILTER_STATUS_ICONS: Record<
  AgentChatThreadFilterStatus,
  IconComponent
> = {
  active: IconCircleDashed,
  needsInput: IconHandClick,
  mentions: IconAt,
  assignedToMe: IconUserCircle,
  assigned: IconUsers,
  unassigned: IconUserOff,
  snoozed: IconZzz,
  done: IconCheck,
};
