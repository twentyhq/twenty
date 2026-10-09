import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  IconAddressBook,
  type IconComponent,
  IconLayoutSidebarRight,
} from 'twenty-ui/icon';

import { AI_CHAT_INBOX_LAYOUT } from '@/ai/constants/AiChatInboxLayout';
import { type AiChatInboxLayout } from '@/ai/types/AiChatInboxLayout';

export const AI_CHAT_INBOX_LAYOUT_OPTIONS: Record<
  AiChatInboxLayout,
  { Icon: IconComponent; label: MessageDescriptor }
> = {
  [AI_CHAT_INBOX_LAYOUT.SPLIT_VIEW]: {
    Icon: IconLayoutSidebarRight,
    label: msg`Split view`,
  },
  [AI_CHAT_INBOX_LAYOUT.RECORD_PAGE]: {
    Icon: IconAddressBook,
    label: msg`Record page`,
  },
};
