import {
  type IconComponent,
  IconAt,
  IconCircleDashed,
  IconClock,
  IconHandClick,
  IconProgressCheck,
} from 'twenty-ui/icon';

import { type AgentChatThreadFilterStatus } from '@/ai/types/AgentChatThreadFilterStatus';

export const AGENT_CHAT_THREAD_FILTER_STATUS_ICONS: Record<
  AgentChatThreadFilterStatus,
  IconComponent
> = {
  active: IconCircleDashed,
  needsInput: IconHandClick,
  mentions: IconAt,
  snoozed: IconClock,
  done: IconProgressCheck,
};
