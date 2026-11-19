import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useToast } from 'twenty-ui/components/feedback';
import { IconDeviceDesktop } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';

import { SettingsOptionCardContentButton } from '@/settings/components/SettingsOptions/SettingsOptionCardContentButton';
import { useSubscribeToWebPushNotifications } from '@/web-push/hooks/useSubscribeToWebPushNotifications';
import { getBrowserNotificationPermission } from '@/web-push/utils/getBrowserNotificationPermission';

export const BrowserNotificationPermissionCard = () => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const [permission, setPermission] = useState(
    getBrowserNotificationPermission,
  );
  const { subscribeToWebPushNotifications } =
    useSubscribeToWebPushNotifications();

  const descriptionByPermission = {
    default: t`Allow this browser to show new inbox messages as notifications`,
    granted: t`New inbox messages show as notifications on this device, even when Twenty is closed`,
    denied: t`Blocked in this browser. Allow notifications for this site in the browser settings`,
    unsupported: t`This browser cannot show notifications`,
  };

  const subscribeToWebPushNotificationsOrShowError = async () => {
    try {
      await subscribeToWebPushNotifications();

      return true;
    } catch {
      enqueueToast({
        status: 'error',
        children: t`This browser could not turn on notifications`,
      });

      return false;
    }
  };

  const allowNotifications = async () => {
    setPermission(await Notification.requestPermission());

    await subscribeToWebPushNotificationsOrShowError();
  };

  const sendTestNotification = async () => {
    const isSubscribed = await subscribeToWebPushNotificationsOrShowError();

    if (!isSubscribed) {
      return;
    }

    const registration = await navigator.serviceWorker.ready;

    await registration.showNotification(t`Notifications are on`, {
      body: t`New inbox messages will show up like this`,
      icon: '/images/icons/android/android-launchericon-192-192.png',
    });
  };

  const buttonByPermission = {
    default: (
      <Button
        size="sm"
        variant="solid"
        color="accent"
        onClick={() => void allowNotifications()}
      >
        {t`Allow`}
      </Button>
    ),
    granted: (
      <Button size="sm" onClick={() => void sendTestNotification()}>
        {t`Send test`}
      </Button>
    ),
    denied: undefined,
    unsupported: undefined,
  };

  return (
    <Card.Root fullWidth>
      <SettingsOptionCardContentButton
        Icon={IconDeviceDesktop}
        title={t`Notifications`}
        description={descriptionByPermission[permission]}
        Button={buttonByPermission[permission]}
      />
    </Card.Root>
  );
};
