import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';

import { BrowserNotificationSetupDialog } from '@/settings/experience/components/BrowserNotificationSetupDialog';
import { BROWSER_NOTIFICATION_SETUP_DIALOG_ID } from '@/settings/experience/constants/BrowserNotificationSetupDialogId';
import { browserNotificationSetupStepState } from '@/settings/experience/states/browserNotificationSetupStepState';
import { type BrowserNotificationSetupStep } from '@/settings/experience/types/BrowserNotificationSetupStep';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const MAC_CHROME_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const MAC_SAFARI_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15';
const WINDOWS_CHROME_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

type BrowserNotificationSetupDialogExampleProps = {
  step: BrowserNotificationSetupStep;
};

const BrowserNotificationSetupDialogExample = ({
  step,
}: BrowserNotificationSetupDialogExampleProps) => {
  const { openDialog } = useDialog();
  const setBrowserNotificationSetupStep = useSetAtomState(
    browserNotificationSetupStepState,
  );

  const openSetupDialog = () => {
    setBrowserNotificationSetupStep(step);
    openDialog(BROWSER_NOTIFICATION_SETUP_DIALOG_ID);
  };

  return (
    <>
      <Button onClick={openSetupDialog}>Open dialog</Button>
      <BrowserNotificationSetupDialog />
    </>
  );
};

const openSetupDialogInCanvas = async ({
  canvasElement,
  title,
}: {
  canvasElement: HTMLElement;
  title: string;
}) => {
  await userEvent.click(
    within(canvasElement).getByRole('button', { name: 'Open dialog' }),
  );

  return within(canvasElement.ownerDocument.body).findByRole('dialog', {
    name: title,
  });
};

const mockUserAgent = (userAgent: string) => () => {
  const userAgentSpy = spyOn(navigator, 'userAgent', 'get').mockReturnValue(
    userAgent,
  );

  return () => userAgentSpy.mockRestore();
};

const meta: Meta<typeof BrowserNotificationSetupDialogExample> = {
  title: 'Modules/Settings/Experience/BrowserNotificationSetupDialog',
  component: BrowserNotificationSetupDialogExample,
  decorators: [ToastDecorator, ComponentDecorator],
  beforeEach: mockUserAgent(MAC_CHROME_USER_AGENT),
};

export default meta;
type Story = StoryObj<typeof BrowserNotificationSetupDialogExample>;

export const Allow: Story = {
  args: { step: 'allow' },
  play: async ({ canvasElement }) => {
    const dialog = await openSetupDialogInCanvas({
      canvasElement,
      title: 'Turn on notifications',
    });

    await waitFor(() =>
      expect(
        within(dialog).getByRole('button', { name: /Continue/ }),
      ).toBeVisible(),
    );
  },
};

export const PromptNotShown: Story = {
  args: { step: 'prompt-not-shown' },
  play: async ({ canvasElement }) => {
    const dialog = await openSetupDialogInCanvas({
      canvasElement,
      title: 'Allow notifications in your browser',
    });

    await waitFor(() =>
      expect(
        within(dialog).getByRole('button', { name: /Read the guide/ }),
      ).toBeVisible(),
    );
  },
};

export const ConfirmThenSystemSettingsOnMac: Story = {
  args: { step: 'confirm' },
  play: async ({ canvasElement }) => {
    const dialog = await openSetupDialogInCanvas({
      canvasElement,
      title: 'Did you see a test notification?',
    });

    await userEvent.click(within(dialog).getByRole('button', { name: /No/ }));

    await waitFor(() =>
      expect(
        within(dialog).getByText('Allow Google Chrome in macOS settings'),
      ).toBeVisible(),
    );
    await waitFor(() =>
      expect(
        within(dialog).getByRole('button', { name: /Open system settings/ }),
      ).toBeVisible(),
    );
  },
};

export const SystemSettingsOnMacSafari: Story = {
  args: { step: 'system-settings' },
  beforeEach: mockUserAgent(MAC_SAFARI_USER_AGENT),
  play: async ({ canvasElement }) => {
    const dialog = await openSetupDialogInCanvas({
      canvasElement,
      title: 'Allow Twenty in macOS settings',
    });

    await waitFor(() =>
      expect(within(dialog).getByText('Notifications › Twenty')).toBeVisible(),
    );
  },
};

export const SystemSettingsOnWindows: Story = {
  args: { step: 'system-settings' },
  beforeEach: mockUserAgent(WINDOWS_CHROME_USER_AGENT),
  play: async ({ canvasElement }) => {
    const dialog = await openSetupDialogInCanvas({
      canvasElement,
      title: 'Allow Google Chrome in Windows settings',
    });

    await waitFor(() =>
      expect(within(dialog).getByText('Do not disturb')).toBeVisible(),
    );
  },
};

export const Success: Story = {
  args: { step: 'success' },
  play: async ({ canvasElement }) => {
    const dialog = await openSetupDialogInCanvas({
      canvasElement,
      title: 'Notifications are set up',
    });

    await userEvent.click(within(dialog).getByRole('button', { name: /Done/ }));

    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
