import { CoreObjectNameSingular } from 'twenty-shared/types';

import { type NotificationStatus } from '@/notification/types/Notification';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';

export const useNotificationActions = () => {
  const { updateOneRecord } = useUpdateOneRecord();

  const setNotificationStatus = async (
    notificationId: string,
    status: NotificationStatus,
  ) => {
    await updateOneRecord({
      objectNameSingular: CoreObjectNameSingular.Notification,
      idToUpdate: notificationId,
      updateOneRecordInput: { status },
    });
  };

  return {
    markNotificationRead: (notificationId: string) =>
      setNotificationStatus(notificationId, 'READ'),
    markNotificationDone: (notificationId: string) =>
      setNotificationStatus(notificationId, 'DONE'),
  };
};
