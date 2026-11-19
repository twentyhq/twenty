import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { isInboxWebPushNotificationPath } from '@/web-push/utils/isInboxWebPushNotificationPath';

export const WebPushNotificationClickEffect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const handleMessage = (
      event: MessageEvent<{ type?: string; url?: string }>,
    ) => {
      if (
        event.data?.type === 'web-push-notification-click' &&
        isInboxWebPushNotificationPath(event.data.url)
      ) {
        navigate(event.data.url);
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () =>
      navigator.serviceWorker.removeEventListener('message', handleMessage);
  }, [navigate]);

  return null;
};
