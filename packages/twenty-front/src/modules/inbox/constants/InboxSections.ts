import { msg } from '@lingui/core/macro';
import { type MessageDescriptor } from '@lingui/core';
import {
  IconCheckbox,
  IconClockHour8,
  IconInbox,
  type IconComponent,
} from 'twenty-ui/icon';

import { InboxItemScope } from '~/generated/graphql';

export type InboxSection = {
  slug: string;
  scope: InboxItemScope;
  label: MessageDescriptor;
  Icon: IconComponent;
};

export const INBOX_SECTIONS: InboxSection[] = [
  {
    slug: 'all',
    scope: InboxItemScope.INBOX,
    label: msg`Inbox`,
    Icon: IconInbox,
  },
  {
    slug: 'snoozed',
    scope: InboxItemScope.SNOOZED,
    label: msg`Snoozed`,
    Icon: IconClockHour8,
  },
  {
    slug: 'done',
    scope: InboxItemScope.DONE,
    label: msg`Done`,
    Icon: IconCheckbox,
  },
];
