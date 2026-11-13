import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  IconAlertCircle,
  IconAt,
  IconCheck,
  type IconComponent,
  IconHandClick,
  IconPencil,
  IconUsers,
  IconX,
} from 'twenty-ui/icon';

import { type InboxThreadReason } from '@/ai/types/AiChatThreadReason';

export const INBOX_THREAD_REASONS: Record<
  InboxThreadReason,
  { Icon: IconComponent; label: MessageDescriptor }
> = {
  needsInput: { Icon: IconHandClick, label: msg`Needs input` },
  mentioned: { Icon: IconAt, label: msg`Mentioned you` },
  assigned: { Icon: IconUsers, label: msg`Assigned to you` },
  finished: { Icon: IconCheck, label: msg`Finished` },
  failed: { Icon: IconAlertCircle, label: msg`Failed` },
  cancelled: { Icon: IconX, label: msg`Cancelled` },
  draft: { Icon: IconPencil, label: msg`Draft` },
};
