import { useEffect } from 'react';

import { useSubscribeToWebPushNotifications } from '@/web-push/hooks/useSubscribeToWebPushNotifications';
import { logError } from '~/utils/logError';

export const WebPushSubscriptionEffect = () => {
  const { subscribeToWebPushNotifications } =
    useSubscribeToWebPushNotifications();

  useEffect(() => {
    subscribeToWebPushNotifications().catch(logError);
  }, [subscribeToWebPushNotifications]);

  return null;
};
