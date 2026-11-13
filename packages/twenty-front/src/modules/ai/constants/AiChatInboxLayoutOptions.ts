import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  IconAddressBook,
  type IconComponent,
  IconLayoutSidebarRight,
} from 'twenty-ui/icon';

import { INBOX_LAYOUT } from '@/ai/constants/AiChatInboxLayout';
import { type InboxLayout } from '@/ai/types/AiChatInboxLayout';

export const INBOX_LAYOUT_OPTIONS: Record<
  InboxLayout,
  { Icon: IconComponent; label: MessageDescriptor }
> = {
  [INBOX_LAYOUT.SPLIT_VIEW]: {
    Icon: IconLayoutSidebarRight,
    label: msg`Split view`,
  },
  [INBOX_LAYOUT.RECORD_PAGE]: {
    Icon: IconAddressBook,
    label: msg`Record page`,
  },
};
