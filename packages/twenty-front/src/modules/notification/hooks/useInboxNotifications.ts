import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useIsNotificationObjectAvailable } from '@/notification/hooks/useIsNotificationObjectAvailable';
import { type Notification } from '@/notification/types/Notification';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useInboxNotifications = () => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const isNotificationObjectAvailable = useIsNotificationObjectAvailable();

  const { records, loading } = useFindManyRecords<Notification>({
    objectNameSingular: CoreObjectNameSingular.Notification,
    filter: {
      workspaceMemberId: { eq: currentWorkspaceMember?.id ?? '' },
    },
    orderBy: [{ createdAt: 'DescNullsLast' }],
    limit: 60,
    skip: !isNotificationObjectAvailable || !isDefined(currentWorkspaceMember),
  });

  const openNotifications = records.filter(
    (notification) => notification.status !== 'DONE',
  );

  return {
    isNotificationObjectAvailable,
    needsAttentionNotifications: openNotifications.filter(
      (notification) => notification.requiresAction,
    ),
    updateNotifications: openNotifications.filter(
      (notification) => !notification.requiresAction,
    ),
    unreadCount: records.filter(
      (notification) => notification.status === 'UNREAD',
    ).length,
    loading,
  };
};
