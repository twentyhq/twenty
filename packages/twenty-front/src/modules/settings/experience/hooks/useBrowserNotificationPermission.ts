import { useState } from 'react';

import { type BrowserNotificationPermission } from '@/settings/experience/types/BrowserNotificationPermission';
import { isPageNotificationSupported } from '~/utils/isPageNotificationSupported';

const getBrowserNotificationPermission = (): BrowserNotificationPermission =>
  isPageNotificationSupported() ? Notification.permission : 'unsupported';

export const useBrowserNotificationPermission = () => {
  const [permission, setPermission] = useState(
    getBrowserNotificationPermission,
  );

  const requestPermission = async () => {
    if (!isPageNotificationSupported()) {
      return;
    }

    setPermission(await Notification.requestPermission());
  };

  return { permission, requestPermission };
};
