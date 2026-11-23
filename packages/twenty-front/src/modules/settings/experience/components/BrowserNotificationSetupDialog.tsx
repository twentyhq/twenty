import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { IconExternalLink, IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Dialog } from 'twenty-ui/primitives/surfaces';

import { BROWSER_NOTIFICATION_SETUP_DIALOG_ID } from '@/settings/experience/constants/BrowserNotificationSetupDialogId';
import { SystemNotificationSettingsIllustration } from '@/settings/experience/components/SystemNotificationSettingsIllustration';
import { type BrowserNotificationSetupStep } from '@/settings/experience/types/BrowserNotificationSetupStep';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { getSystemNotificationSettings } from '@/web-push/utils/getSystemNotificationSettings';

const StyledHeaderTop = styled.div`
  display: flex;
  justify-content: flex-end;
`;

type BrowserNotificationSetupDialogProps = {
  step: BrowserNotificationSetupStep;
  isLoading: boolean;
  onAllow: () => void;
  onSendTestAfterSystemSettings: () => void;
  onStepChange: (step: BrowserNotificationSetupStep) => void;
  onOpenHelp: () => void;
};

export const BrowserNotificationSetupDialog = ({
  step,
  isLoading,
  onAllow,
  onSendTestAfterSystemSettings,
  onStepChange,
  onOpenHelp,
}: BrowserNotificationSetupDialogProps) => {
  const { t } = useLingui();
  const { closeDialog } = useDialog();
  const { operatingSystem, browserName, settingsEntryName, url } =
    getSystemNotificationSettings();
  const browserLabel = browserName ?? t`your browser`;
  const settingsEntryLabel = settingsEntryName ?? browserLabel;

  const closeSetupDialog = () =>
    closeDialog(BROWSER_NOTIFICATION_SETUP_DIALOG_ID);

  const closeSetupDialogAndOpenHelp = () => {
    closeSetupDialog();
    onOpenHelp();
  };

  const titleByStep: Record<BrowserNotificationSetupStep, string> = {
    allow: t`Turn on notifications`,
    confirm: t`Did you see a test notification?`,
    'system-settings':
      operatingSystem === 'mac'
        ? t`Allow ${settingsEntryLabel} in macOS settings`
        : operatingSystem === 'windows'
          ? t`Allow ${settingsEntryLabel} in Windows settings`
          : t`Check your system notification settings`,
    'confirm-after-system-settings': t`Did you see it this time?`,
    success: t`Notifications are set up`,
  };

  const descriptionByStep: Record<BrowserNotificationSetupStep, string> = {
    allow: t`Your browser will ask to show notifications from Twenty. Choose Allow.`,
    confirm: t`We just sent one. It shows up in a corner of your screen.`,
    'system-settings':
      operatingSystem === 'mac'
        ? t`macOS can block notifications even when ${browserLabel} allows Twenty. Open Notifications, select ${settingsEntryLabel} and turn on Allow notifications. If Focus is on, turn it off. Then send a test.`
        : operatingSystem === 'windows'
          ? t`Windows can block ${browserLabel} even when Twenty is allowed. Open Notifications, turn on ${settingsEntryLabel} and turn off Do not disturb. Then send a test.`
          : t`Your system can block ${browserLabel} even when Twenty is allowed. Allow notifications for ${browserLabel} in your system settings, then send a test.`,
    'confirm-after-system-settings': t`We just sent another test notification.`,
    success: t`New inbox messages will show up like the test notification while your browser is running.`,
  };

  const sendTestButton = (
    <Button
      variant={isDefined(url) ? undefined : 'solid'}
      color={isDefined(url) ? undefined : 'accent'}
      fullWidth
      onClick={onSendTestAfterSystemSettings}
      loading={isLoading}
    >
      {t`Send test`}
    </Button>
  );

  const footerByStep: Record<BrowserNotificationSetupStep, ReactNode> = {
    allow: (
      <Button
        variant="solid"
        color="accent"
        fullWidth
        onClick={onAllow}
        loading={isLoading}
      >
        {t`Continue`}
      </Button>
    ),
    confirm: (
      <>
        <Button
          variant="solid"
          color="accent"
          fullWidth
          onClick={() => onStepChange('success')}
        >
          {t`Yes, I saw it`}
        </Button>
        <Button fullWidth onClick={() => onStepChange('system-settings')}>
          {t`No`}
        </Button>
      </>
    ),
    'system-settings': (
      <>
        {isDefined(url) && (
          <Button
            variant="solid"
            color="accent"
            fullWidth
            endIcon={<IconExternalLink />}
            onClick={() => window.location.assign(url)}
          >
            {t`Open system settings`}
          </Button>
        )}
        {sendTestButton}
      </>
    ),
    'confirm-after-system-settings': (
      <>
        <Button
          variant="solid"
          color="accent"
          fullWidth
          onClick={() => onStepChange('success')}
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
            <Dialog.Title>{titleByStep[step]}</Dialog.Title>
            <Dialog.Description>{descriptionByStep[step]}</Dialog.Description>
          </Dialog.Header>
          {step === 'system-settings' &&
            operatingSystem !== 'other' &&
            isDefined(settingsEntryName) && (
              <Dialog.Body>
                <SystemNotificationSettingsIllustration
                  operatingSystem={operatingSystem}
                  settingsEntryName={settingsEntryName}
                />
              </Dialog.Body>
            )}
          <Dialog.Footer>{footerByStep[step]}</Dialog.Footer>
        </Dialog.Popup>
      )}
    </DialogInstance>
  );
};
