import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// Exact unread count from totalCount, independent of the inbox page size.
// Resolves the notification object metadata: only call from components
// gated behind useIsNotificationObjectAvailable.
export const useUnreadNotificationsCount = () => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const { totalCount } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Notification,
    filter: {
      workspaceMemberId: { eq: currentWorkspaceMember?.id ?? '' },
      status: { eq: 'UNREAD' },
    },
    recordGqlFields: { id: true },
    limit: 1,
    skip: !isDefined(currentWorkspaceMember),
  });

  return { unreadCount: totalCount ?? 0 };
};
