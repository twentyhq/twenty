import { useEffect } from 'react';

import { useSubscribeToPushNotifications } from '@/web-push/hooks/useSubscribeToPushNotifications';
import { logError } from '~/utils/logError';

export const PushSubscriptionEffect = () => {
  const { subscribeToPushNotifications } = useSubscribeToPushNotifications();

  useEffect(() => {
    subscribeToPushNotifications().catch(logError);
  }, [subscribeToPushNotifications]);

  return null;
};
