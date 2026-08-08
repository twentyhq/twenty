import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useInboxItemActions } from '@/inbox/hooks/useInboxItemActions';

// Opening an item is what marks it read, and opening it is a render rather
// than an event, so the effect lives in its own component.
export const InboxItemMarkReadEffect = ({
  inboxItemId,
  isUnread,
}: {
  inboxItemId?: string;
  isUnread: boolean;
}) => {
  const { markInboxItemRead } = useInboxItemActions();

  useEffect(() => {
    if (isUnread && isDefined(inboxItemId)) {
      void markInboxItemRead({ inboxItemId });
    }
  }, [isUnread, inboxItemId, markInboxItemRead]);

  return null;
};
