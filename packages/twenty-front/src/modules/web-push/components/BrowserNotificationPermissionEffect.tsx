import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { browserNotificationPermissionState } from '@/web-push/states/browserNotificationPermissionState';
import { getBrowserNotificationPermission } from '@/web-push/utils/getBrowserNotificationPermission';
import { logError } from '~/utils/logError';

export const BrowserNotificationPermissionEffect = () => {
  const setBrowserNotificationPermission = useSetAtomState(
    browserNotificationPermissionState,
  );

  useEffect(() => {
    const syncBrowserNotificationPermission = () =>
      setBrowserNotificationPermission(getBrowserNotificationPermission());

    syncBrowserNotificationPermission();

    if (!isDefined(navigator.permissions)) {
      return;
    }

    const abortController = new AbortController();

    navigator.permissions
      .query({ name: 'notifications' })
      .then((permissionStatus) =>
        permissionStatus.addEventListener(
          'change',
          syncBrowserNotificationPermission,
          { signal: abortController.signal },
        ),
      )
      .catch(logError);

    return () => abortController.abort();
  }, [setBrowserNotificationPermission]);

  return null;
};
