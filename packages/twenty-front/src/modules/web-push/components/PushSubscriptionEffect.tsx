import { useEffect } from 'react';

import { useIsWebPushAvailable } from '@/web-push/hooks/useIsWebPushAvailable';
import { useSubscribeToPushNotifications } from '@/web-push/hooks/useSubscribeToPushNotifications';
import { logError } from '~/utils/logError';

export const PushSubscriptionEffect = () => {
  const isWebPushAvailable = useIsWebPushAvailable();
  const { subscribeToPushNotifications } = useSubscribeToPushNotifications();

  useEffect(() => {
    if (!isWebPushAvailable) {
      return;
    }

    subscribeToPushNotifications().catch(logError);
  }, [isWebPushAvailable, subscribeToPushNotifications]);

  return null;
};
