import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconDeviceDesktop } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';

import { SettingsOptionCardContentButton } from '@/settings/components/SettingsOptions/SettingsOptionCardContentButton';
import { useBrowserNotificationPermission } from '@/settings/experience/hooks/useBrowserNotificationPermission';
import { createPageNotification } from '~/utils/createPageNotification';

export const BrowserNotificationPermissionCard = () => {
  const { t } = useLingui();
  const { permission, requestPermission } = useBrowserNotificationPermission();

  const descriptionByPermission = {
    default: t`Allow this browser to show new messages on your desktop`,
    granted: t`New messages show on your desktop while Twenty is open in this browser`,
    denied: t`Blocked in this browser. Allow notifications for this site in the browser settings`,
    unsupported: t`This browser cannot show desktop notifications`,
  };

  const sendTestNotification = () => {
    const notification = createPageNotification(
      t`Desktop notifications are on`,
      { body: t`New messages will show up like this` },
    );

    if (isDefined(notification)) {
      notification.onclick = () => notification.close();
    }
  };

  const buttonByPermission = {
    default: (
      <Button
        size="sm"
        variant="solid"
        color="accent"
        onClick={() => void requestPermission()}
      >
        {t`Allow`}
      </Button>
    ),
    granted: (
      <Button size="sm" onClick={sendTestNotification}>
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
        title={t`Desktop notifications`}
        description={descriptionByPermission[permission]}
        Button={buttonByPermission[permission]}
      />
    </Card.Root>
  );
};
