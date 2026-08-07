import { t } from '@lingui/core/macro';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { type NotificationStatus } from '@/notification/types/Notification';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

export const useNotificationActions = () => {
  const { updateOneRecord } = useUpdateOneRecord();
  const { enqueueErrorSnackBar } = useSnackBar();

  const setNotificationStatus = async (
    notificationId: string,
    status: NotificationStatus,
  ): Promise<boolean> => {
    try {
      await updateOneRecord({
        objectNameSingular: CoreObjectNameSingular.Notification,
        idToUpdate: notificationId,
        updateOneRecordInput: { status },
      });
      return true;
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to update the notification`,
      });
      return false;
    }
  };

  return {
    markNotificationRead: (notificationId: string) =>
      setNotificationStatus(notificationId, 'READ'),
    markNotificationDone: (notificationId: string) =>
      setNotificationStatus(notificationId, 'DONE'),
  };
};
