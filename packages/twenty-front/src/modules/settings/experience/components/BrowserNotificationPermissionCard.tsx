import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconDeviceDesktop, IconHelp } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

import { SettingsOptionCardContentButton } from '@/settings/components/SettingsOptions/SettingsOptionCardContentButton';
import { BrowserNotificationSetupDialog } from '@/settings/experience/components/BrowserNotificationSetupDialog';
import { BROWSER_NOTIFICATION_SETUP_DIALOG_ID } from '@/settings/experience/constants/BrowserNotificationSetupDialogId';
import { useSendBrowserTestNotification } from '@/settings/experience/hooks/useSendBrowserTestNotification';
import { browserNotificationSetupStepState } from '@/settings/experience/states/browserNotificationSetupStepState';
import { type BrowserNotificationSetupStep } from '@/settings/experience/types/BrowserNotificationSetupStep';
import { openInboxNotificationsHelp } from '@/settings/experience/utils/openInboxNotificationsHelp';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { BrowserNotificationPermissionEffect } from '@/web-push/components/BrowserNotificationPermissionEffect';
import { browserNotificationPermissionState } from '@/web-push/states/browserNotificationPermissionState';

const StyledButtons = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

export const BrowserNotificationPermissionCard = () => {
  const { t } = useLingui();
  const { openDialog } = useDialog();
  const browserNotificationPermission = useAtomStateValue(
    browserNotificationPermissionState,
  );
  const setBrowserNotificationSetupStep = useSetAtomState(
    browserNotificationSetupStepState,
  );
  const [isSendingTestNotification, setIsSendingTestNotification] =
    useState(false);
  const { sendBrowserTestNotification } = useSendBrowserTestNotification();

  const descriptionByPermission = {
    default: t`Allow this browser to show new inbox messages as notifications`,
    granted: t`New inbox messages notify you while your browser is running`,
    denied: t`Blocked in this browser. Allow notifications for this site in the browser settings`,
    unsupported: t`This browser cannot show notifications`,
  };

  const openSetupDialogAtStep = (step: BrowserNotificationSetupStep) => {
    setBrowserNotificationSetupStep(step);
    openDialog(BROWSER_NOTIFICATION_SETUP_DIALOG_ID);
  };

  // The OS can block the browser while permission stays granted, so ask the user
  const sendTestNotificationAndAskIfSeen = async () => {
    setIsSendingTestNotification(true);

    const isSent = await sendBrowserTestNotification().finally(() =>
      setIsSendingTestNotification(false),
    );

    if (isSent) {
      openSetupDialogAtStep('confirm');
    }
  };

  const helpButton = (
    <Button
      size="sm"
      variant="ghost"
      startIcon={<IconHelp />}
      onClick={openInboxNotificationsHelp}
    >
      {t`Help`}
    </Button>
  );

  const buttonByPermission = {
    default: (
      <Button
        size="sm"
        variant="solid"
        color="accent"
        onClick={() => openSetupDialogAtStep('allow')}
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
          loading={isSendingTestNotification}
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
          description={descriptionByPermission[browserNotificationPermission]}
          Button={buttonByPermission[browserNotificationPermission]}
        />
      </Card.Root>
      <BrowserNotificationPermissionEffect />
      <BrowserNotificationSetupDialog />
    </>
  );
};
