import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { InboxItemScope, InboxQueueAssignment } from '~/generated/graphql';

export type InboxQueueViewKey =
  | 'unassigned'
  | 'assigned'
  | 'snoozed'
  | 'archived';

export type InboxQueueView = {
  key: InboxQueueViewKey;
  label: MessageDescriptor;
  scope: InboxItemScope;
  assignment: InboxQueueAssignment;
};

// Open work is split by who holds it, because that is the question a shared
// inbox answers. Snoozed and archived are read whole: once something is out
// of the way, who had it no longer sorts it.
export const INBOX_QUEUE_VIEWS: InboxQueueView[] = [
  {
    key: 'unassigned',
    label: msg`Unassigned`,
    scope: InboxItemScope.INBOX,
    assignment: InboxQueueAssignment.UNASSIGNED,
  },
  {
    key: 'assigned',
    label: msg`Assigned`,
    scope: InboxItemScope.INBOX,
    assignment: InboxQueueAssignment.ASSIGNED,
  },
  {
    key: 'snoozed',
    label: msg`Snoozed`,
    scope: InboxItemScope.SNOOZED,
    assignment: InboxQueueAssignment.ALL,
  },
  {
    key: 'archived',
    label: msg`Archived`,
    scope: InboxItemScope.ARCHIVED,
    assignment: InboxQueueAssignment.ALL,
  },
];
