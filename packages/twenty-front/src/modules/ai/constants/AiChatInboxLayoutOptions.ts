import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  IconAddressBook,
  type IconComponent,
  IconLayoutSidebarRight,
} from 'twenty-ui/icon';

import { type AiChatInboxLayout } from '@/ai/types/AiChatInboxLayout';

export const AI_CHAT_INBOX_LAYOUT_OPTIONS: Record<
  AiChatInboxLayout,
  { Icon: IconComponent; label: MessageDescriptor }
> = {
  'split-view': { Icon: IconLayoutSidebarRight, label: msg`Split view` },
  'record-page': { Icon: IconAddressBook, label: msg`Record page` },
};
