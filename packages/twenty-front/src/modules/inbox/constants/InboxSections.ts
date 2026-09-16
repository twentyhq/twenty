import { msg } from '@lingui/core/macro';
import { type MessageDescriptor } from '@lingui/core';
import {
  IconArchive,
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
    slug: 'open',
    scope: InboxItemScope.INBOX,
    label: msg`Open`,
    Icon: IconInbox,
  },
  {
    slug: 'snoozed',
    scope: InboxItemScope.SNOOZED,
    label: msg`Snoozed`,
    Icon: IconClockHour8,
  },
  {
    slug: 'archived',
    scope: InboxItemScope.ARCHIVED,
    label: msg`Archived`,
    Icon: IconArchive,
  },
];
