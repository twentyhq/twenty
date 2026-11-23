import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { IconExternalLink, IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Dialog } from 'twenty-ui/primitives/surfaces';

import { SystemNotificationSettingsIllustration } from '@/settings/experience/components/SystemNotificationSettingsIllustration';
import { BROWSER_NOTIFICATION_SETUP_DIALOG_ID } from '@/settings/experience/constants/BrowserNotificationSetupDialogId';
import { useSendBrowserTestNotification } from '@/settings/experience/hooks/useSendBrowserTestNotification';
import { browserNotificationSetupStepState } from '@/settings/experience/states/browserNotificationSetupStepState';
import { type BrowserNotificationSetupStep } from '@/settings/experience/types/BrowserNotificationSetupStep';
import { openInboxNotificationsHelp } from '@/settings/experience/utils/openInboxNotificationsHelp';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { browserNotificationPermissionState } from '@/web-push/states/browserNotificationPermissionState';
import { type SystemNotificationSettings } from '@/web-push/types/SystemNotificationSettings';
import { getSystemNotificationSettings } from '@/web-push/utils/getSystemNotificationSettings';

const StyledHeaderTop = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const BrowserNotificationSetupDialog = () => {
  const { t } = useLingui();
  const { closeDialog } = useDialog();
  const [browserNotificationSetupStep, setBrowserNotificationSetupStep] =
    useAtomState(browserNotificationSetupStepState);
  const setBrowserNotificationPermission = useSetAtomState(
    browserNotificationPermissionState,
  );
  const [isLoading, setIsLoading] = useState(false);
  const { sendBrowserTestNotification } = useSendBrowserTestNotification();

  const systemNotificationSettings = getSystemNotificationSettings();
  const systemSettingsLink =
    systemNotificationSettings.operatingSystem === 'other'
      ? undefined
      : systemNotificationSettings;
  const browserLabel =
    systemNotificationSettings.browserName ?? t`your browser`;
  const settingsEntryLabel =
    systemSettingsLink?.settingsEntryName ?? browserLabel;
  const isSendTestPrimary = !isDefined(systemSettingsLink);

  const closeSetupDialog = () =>
    closeDialog(BROWSER_NOTIFICATION_SETUP_DIALOG_ID);

  const closeSetupDialogAndOpenHelp = () => {
    closeSetupDialog();
    openInboxNotificationsHelp();
  };

  const sendTestNotificationAndAskIfSeen = async (
    confirmStep: Extract<
      BrowserNotificationSetupStep,
      'confirm' | 'confirm-after-system-settings'
    >,
  ) => {
    setIsLoading(true);

    const isSent = await sendBrowserTestNotification().finally(() =>
      setIsLoading(false),
    );

    if (!isSent) {
      closeSetupDialog();

      return;
    }

    setBrowserNotificationSetupStep(confirmStep);
  };

  const allowNotifications = async () => {
    setIsLoading(true);

    const requestedPermission = await Notification.requestPermission().finally(
      () => setIsLoading(false),
    );

    setBrowserNotificationPermission(requestedPermission);

    if (requestedPermission === 'granted') {
      await sendTestNotificationAndAskIfSeen('confirm');

      return;
    }

    if (requestedPermission === 'denied') {
      closeSetupDialog();

      return;
    }

    setBrowserNotificationSetupStep('prompt-not-shown');
  };

  const systemSettingsTitleByOperatingSystem: Record<
    SystemNotificationSettings['operatingSystem'],
    string
  > = {
    mac: t`Allow ${settingsEntryLabel} in macOS settings`,
    windows: t`Allow ${settingsEntryLabel} in Windows settings`,
    other: t`Check your system notification settings`,
  };

  const systemSettingsDescriptionByOperatingSystem: Record<
    SystemNotificationSettings['operatingSystem'],
    string
  > = {
    mac: t`macOS can block notifications even when ${browserLabel} allows Twenty. Open Notifications, select ${settingsEntryLabel} and turn on Allow notifications. If Focus is on, turn it off. Then send a test.`,
    windows: t`Windows can block ${browserLabel} even when Twenty is allowed. Open Notifications, turn on ${settingsEntryLabel} and turn off Do not disturb. Then send a test.`,
    other: t`Your system can block ${browserLabel} even when Twenty is allowed. Allow notifications for ${browserLabel} in your system settings, then send a test.`,
  };

  const titleByStep: Record<BrowserNotificationSetupStep, string> = {
    allow: t`Turn on notifications`,
    'prompt-not-shown': t`Allow notifications in your browser`,
    confirm: t`Did you see a test notification?`,
    'system-settings':
      systemSettingsTitleByOperatingSystem[
        systemNotificationSettings.operatingSystem
      ],
    'confirm-after-system-settings': t`Did you see it this time?`,
    success: t`Notifications are set up`,
  };

  const descriptionByStep: Record<BrowserNotificationSetupStep, string> = {
    allow: t`Your browser will ask to show notifications from Twenty. Choose Allow.`,
    'prompt-not-shown': t`Your browser closed the request or showed it as an icon in the address bar. Click that icon and choose Allow, then continue.`,
    confirm: t`We just sent one. It shows up in a corner of your screen.`,
    'system-settings':
      systemSettingsDescriptionByOperatingSystem[
        systemNotificationSettings.operatingSystem
      ],
    'confirm-after-system-settings': t`We just sent another test notification.`,
    success: t`New inbox messages will show up like the test notification while your browser is running.`,
  };

  const continueButton = (
    <Button
      variant="solid"
      color="accent"
      fullWidth
      onClick={() => void allowNotifications()}
      loading={isLoading}
    >
      {t`Continue`}
    </Button>
  );

  const footerByStep: Record<BrowserNotificationSetupStep, ReactNode> = {
    allow: continueButton,
    'prompt-not-shown': (
      <>
        {continueButton}
        <Button
          fullWidth
          endIcon={<IconExternalLink />}
          onClick={closeSetupDialogAndOpenHelp}
        >
          {t`Read the guide`}
        </Button>
      </>
    ),
    confirm: (
      <>
        <Button
          variant="solid"
          color="accent"
          fullWidth
          onClick={() => setBrowserNotificationSetupStep('success')}
        >
          {t`Yes, I saw it`}
        </Button>
        <Button
          fullWidth
          onClick={() => setBrowserNotificationSetupStep('system-settings')}
        >
          {t`No`}
        </Button>
      </>
    ),
    'system-settings': (
      <>
        {isDefined(systemSettingsLink) && (
          <Button
            variant="solid"
            color="accent"
            fullWidth
            endIcon={<IconExternalLink />}
            onClick={() => window.location.assign(systemSettingsLink.url)}
          >
            {t`Open system settings`}
          </Button>
        )}
        <Button
          variant={isSendTestPrimary ? 'solid' : 'outline'}
          color={isSendTestPrimary ? 'accent' : 'neutral'}
          fullWidth
          onClick={() =>
            void sendTestNotificationAndAskIfSeen(
              'confirm-after-system-settings',
            )
          }
          loading={isLoading}
        >
          {t`Send test`}
        </Button>
      </>
    ),
    'confirm-after-system-settings': (
      <>
        <Button
          variant="solid"
          color="accent"
          fullWidth
          onClick={() => setBrowserNotificationSetupStep('success')}
        >
          {t`Yes, I saw it`}
        </Button>
        <Button
          fullWidth
          endIcon={<IconExternalLink />}
          onClick={closeSetupDialogAndOpenHelp}
        >
          {t`No, read the guide`}
        </Button>
      </>
    ),
    success: (
      <Button
        variant="solid"
        color="accent"
        fullWidth
        onClick={closeSetupDialog}
      >
        {t`Done`}
      </Button>
    ),
  };

  return (
    <DialogInstance
      dialogId={BROWSER_NOTIFICATION_SETUP_DIALOG_ID}
      dismissible
      renderInDocumentBody
    >
      {({ onKeyDown }) => (
        <Dialog.Popup onKeyDown={onKeyDown} size="compact">
          <Dialog.Header>
            <StyledHeaderTop>
              <IconButton
                variant="ghost"
                size="sm"
                aria-label={t`Close`}
                onClick={closeSetupDialog}
              >
                <IconX />
              </IconButton>
            </StyledHeaderTop>
            <Dialog.Title>
              {titleByStep[browserNotificationSetupStep]}
            </Dialog.Title>
            <Dialog.Description>
              {descriptionByStep[browserNotificationSetupStep]}
            </Dialog.Description>
          </Dialog.Header>
          {browserNotificationSetupStep === 'system-settings' &&
            isDefined(systemSettingsLink) &&
            isDefined(systemSettingsLink.settingsEntryName) && (
              <Dialog.Body>
                <SystemNotificationSettingsIllustration
                  operatingSystem={systemSettingsLink.operatingSystem}
                  settingsEntryName={systemSettingsLink.settingsEntryName}
                />
              </Dialog.Body>
            )}
          <Dialog.Footer>
            {footerByStep[browserNotificationSetupStep]}
          </Dialog.Footer>
        </Dialog.Popup>
      )}
    </DialogInstance>
  );
};
