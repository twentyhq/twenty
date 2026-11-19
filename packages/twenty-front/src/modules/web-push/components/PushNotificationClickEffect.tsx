import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { isInboxPushNotificationPath } from '@/web-push/utils/isInboxPushNotificationPath';

export const PushNotificationClickEffect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const handleMessage = (
      event: MessageEvent<{ type?: string; url?: string }>,
    ) => {
      if (
        event.data?.type === 'push-notification-click' &&
        isInboxPushNotificationPath(event.data.url)
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
