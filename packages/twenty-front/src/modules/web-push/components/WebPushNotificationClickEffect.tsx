import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { isInboxPath } from '~/utils/isInboxPath';

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
        isNonEmptyString(event.data.url) &&
        isInboxPath(event.data.url)
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
