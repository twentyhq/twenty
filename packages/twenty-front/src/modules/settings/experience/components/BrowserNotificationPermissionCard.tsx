import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { DOCUMENTATION_PATHS } from 'twenty-shared/constants';
import { useToast } from 'twenty-ui/components/feedback';
import { IconDeviceDesktop, IconHelp } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

import { SettingsOptionCardContentButton } from '@/settings/components/SettingsOptions/SettingsOptionCardContentButton';
import { BrowserNotificationSetupDialog } from '@/settings/experience/components/BrowserNotificationSetupDialog';
import { BROWSER_NOTIFICATION_SETUP_DIALOG_ID } from '@/settings/experience/constants/BrowserNotificationSetupDialogId';
import { type BrowserNotificationSetupStep } from '@/settings/experience/types/BrowserNotificationSetupStep';
import { getDocumentationUrl } from '@/support/utils/getDocumentationUrl';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useSubscribeToWebPushNotifications } from '@/web-push/hooks/useSubscribeToWebPushNotifications';
import { getBrowserNotificationPermission } from '@/web-push/utils/getBrowserNotificationPermission';
import { openUrlInNewTab } from '~/utils/openUrlInNewTab';

const INBOX_NOTIFICATIONS_DOCUMENTATION_URL = getDocumentationUrl({
  path: DOCUMENTATION_PATHS.USER_GUIDE_AI_HOW_TOS_INBOX_NOTIFICATIONS,
});

const StyledButtons = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

export const BrowserNotificationPermissionCard = () => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const { openDialog, closeDialog } = useDialog();
  const [permission, setPermission] = useState(
    getBrowserNotificationPermission,
  );
  const [setupStep, setSetupStep] =
    useState<BrowserNotificationSetupStep>('allow');
  const [isSetupLoading, setIsSetupLoading] = useState(false);
  const { subscribeToWebPushNotifications } =
    useSubscribeToWebPushNotifications();

  const descriptionByPermission = {
    default: t`Allow this browser to show new inbox messages as notifications`,
    granted: t`New inbox messages notify you while your browser is running`,
    denied: t`Blocked in this browser. Allow notifications for this site in the browser settings`,
    unsupported: t`This browser cannot show notifications`,
  };

  const openNotificationsHelp = () =>
    openUrlInNewTab(INBOX_NOTIFICATIONS_DOCUMENTATION_URL);

  const helpButton = (
    <Button
      size="sm"
      variant="ghost"
      startIcon={<IconHelp />}
      onClick={openNotificationsHelp}
    >
      {t`Help`}
    </Button>
  );

  const subscribeToWebPushNotificationsOrShowError = async () => {
    try {
      await subscribeToWebPushNotifications();

      return true;
    } catch {
      enqueueToast({
        status: 'error',
        children: t`This browser could not turn on notifications`,
        action: (
          <Button size="sm" variant="ghost" onClick={openNotificationsHelp}>
            {t`Get help`}
          </Button>
        ),
      });

      return false;
    }
  };

  const sendTestNotification = async () => {
    const isSubscribed = await subscribeToWebPushNotificationsOrShowError();

    if (!isSubscribed) {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;

    await registration.showNotification(t`Notifications are on`, {
      body: t`New inbox messages will show up like this`,
      icon: '/images/icons/android/android-launchericon-192-192.png',
    });

    return true;
  };

  // The OS can block the browser while Notification.permission stays
  // granted, so only the user can confirm the test notification showed up
  const sendTestNotificationAndAskIfSeen = async (
    confirmStep: Extract<
      BrowserNotificationSetupStep,
      'confirm' | 'confirm-after-system-settings'
    > = 'confirm',
  ) => {
    setIsSetupLoading(true);

    const isSent = await sendTestNotification().finally(() =>
      setIsSetupLoading(false),
    );

    if (!isSent) {
      closeDialog(BROWSER_NOTIFICATION_SETUP_DIALOG_ID);

      return;
    }

    setSetupStep(confirmStep);
    openDialog(BROWSER_NOTIFICATION_SETUP_DIALOG_ID);
  };

  const openSetupDialog = () => {
    setSetupStep('allow');
    openDialog(BROWSER_NOTIFICATION_SETUP_DIALOG_ID);
  };

  const allowNotifications = async () => {
    setIsSetupLoading(true);

    const requestedPermission = await Notification.requestPermission().finally(
      () => setIsSetupLoading(false),
    );

    setPermission(requestedPermission);

    if (requestedPermission === 'granted') {
      await sendTestNotificationAndAskIfSeen();

      return;
    }

    if (requestedPermission === 'denied') {
      closeDialog(BROWSER_NOTIFICATION_SETUP_DIALOG_ID);
    }
  };

  const buttonByPermission = {
    default: (
      <Button
        size="sm"
        variant="solid"
        color="accent"
        onClick={openSetupDialog}
      >
        {t`Allow`}
      </Button>
    ),
    granted: (
      <StyledButtons>
        {helpButton}
        <Button
          size="sm"
          onClick={() => void sendTestNotificationAndAskIfSeen()}
          loading={isSetupLoading}
        >
          {t`Send test`}
        </Button>
      </StyledButtons>
    ),
    denied: helpButton,
    unsupported: undefined,
  };

  return (
    <>
      <Card.Root fullWidth>
        <SettingsOptionCardContentButton
          Icon={IconDeviceDesktop}
          title={t`Notifications`}
          description={descriptionByPermission[permission]}
          Button={buttonByPermission[permission]}
        />
      </Card.Root>
      <BrowserNotificationSetupDialog
        step={setupStep}
        isLoading={isSetupLoading}
        onAllow={() => void allowNotifications()}
        onSendTestAfterSystemSettings={() =>
          void sendTestNotificationAndAskIfSeen('confirm-after-system-settings')
        }
        onStepChange={setSetupStep}
        onOpenHelp={openNotificationsHelp}
      />
    </>
  );
};
