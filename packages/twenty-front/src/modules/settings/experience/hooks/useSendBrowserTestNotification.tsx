import { useLingui } from '@lingui/react/macro';
import { useToast } from 'twenty-ui/components/feedback';
import { Button } from 'twenty-ui/primitives/input';

import { openInboxNotificationsHelp } from '@/settings/experience/utils/openInboxNotificationsHelp';
import { useSubscribeToWebPushNotifications } from '@/web-push/hooks/useSubscribeToWebPushNotifications';

export const useSendBrowserTestNotification = () => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const { subscribeToWebPushNotifications } =
    useSubscribeToWebPushNotifications();

  const sendBrowserTestNotification = async () => {
    try {
      await subscribeToWebPushNotifications();
    } catch {
      enqueueToast({
        status: 'error',
        children: t`This browser could not turn on notifications`,
        action: (
          <Button
            size="sm"
            variant="ghost"
            onClick={openInboxNotificationsHelp}
          >
            {t`Get help`}
          </Button>
        ),
      });

      return false;
    }

    const registration = await navigator.serviceWorker.ready;

    await registration.showNotification(t`Notifications are on`, {
      body: t`New inbox messages will show up like this`,
      icon: '/images/icons/android/android-launchericon-192-192.png',
    });

    return true;
  };

  return { sendBrowserTestNotification };
};
