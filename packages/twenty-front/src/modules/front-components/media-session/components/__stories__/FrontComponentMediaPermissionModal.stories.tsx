import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { FrontComponentMediaPermissionModal } from '@/front-components/media-session/components/FrontComponentMediaPermissionModal';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { delay, graphql, HttpResponse } from 'msw';
import { useEffect } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { PermissionFlagType } from 'twenty-shared/constants';
import { ComponentDecorator } from 'twenty-ui/testing';
import { RootDecorator } from '~/testing/decorators/RootDecorator';

const APPLICATION_ID = 'application-id';
const DIALOG_ID = 'media-permission-story';

const grantRequest = fn();
const resolveRequest = fn();

let abortController = new AbortController();

const grantResponse = {
  data: {
    grantApplicationCapabilities: {
      __typename: 'ApplicationCapabilityGrant',
      id: APPLICATION_ID,
      grantedCapabilities: ['microphone', 'camera'],
    },
  },
};

const setManageAppsPermission = (canManageApps: boolean) => {
  jotaiStore.set(currentUserWorkspaceState.atom, {
    permissionFlags: canManageApps ? [PermissionFlagType.APPLICATIONS] : [],
    twoFactorAuthenticationMethodSummary: null,
    objectsPermissions: [],
  } as never);
};

const MediaPermissionModalStory = ({
  canManageApps,
}: {
  canManageApps: boolean;
}) => {
  const { openDialog } = useDialog();

  useEffect(() => {
    setManageAppsPermission(canManageApps);
    openDialog(DIALOG_ID);
  }, [canManageApps, openDialog]);

  return (
    <FrontComponentMediaPermissionModal
      applicationId={APPLICATION_ID}
      applicationName="Media Notes"
      modalInstanceId={DIALOG_ID}
      request={{
        capabilities: ['microphone'],
        abortSignal: abortController.signal,
        resolve: resolveRequest,
      }}
    />
  );
};

const meta: Meta<typeof MediaPermissionModalStory> = {
  title: 'Modules/FrontComponents/FrontComponentMediaPermissionModal',
  component: MediaPermissionModalStory,
  decorators: [RootDecorator, ComponentDecorator],
  args: { canManageApps: true },
  parameters: {
    msw: {
      handlers: [
        graphql.mutation('GrantApplicationCapabilities', ({ variables }) => {
          grantRequest(variables.input);

          return HttpResponse.json(grantResponse);
        }),
      ],
    },
  },
  beforeEach: () => {
    grantRequest.mockClear();
    resolveRequest.mockClear();
    abortController = new AbortController();
  },
};

export default meta;

type Story = StoryObj<typeof MediaPermissionModalStory>;

const findDialog = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body).findByRole('dialog');

export const GrantsWorkspaceWideAccess: Story = {
  play: async ({ canvasElement }) => {
    const dialog = within(await findDialog(canvasElement));

    await expect(
      dialog.getByText('Allow media access for Media Notes?'),
    ).toBeVisible();
    await expect(dialog.getByText('Use your microphone')).toBeVisible();
    await expect(dialog.queryByText('Use your camera')).not.toBeInTheDocument();
    await expect(
      dialog.getByText(
        'This grants access to this app for everyone in your workspace.',
      ),
    ).toBeVisible();

    await userEvent.click(dialog.getByRole('button', { name: 'Authorize' }));

    await waitFor(async () => {
      await expect(grantRequest).toHaveBeenCalledWith({
        applicationId: APPLICATION_ID,
        capabilities: ['microphone'],
      });
    });
    await waitFor(async () => {
      await expect(resolveRequest).toHaveBeenCalledWith([
        'microphone',
        'camera',
      ]);
    });
  },
};

export const CancelsWithoutGranting: Story = {
  play: async ({ canvasElement }) => {
    const dialog = within(await findDialog(canvasElement));

    await userEvent.click(dialog.getByRole('button', { name: 'Cancel' }));

    await expect(resolveRequest).toHaveBeenCalledWith(null);
    await expect(grantRequest).not.toHaveBeenCalled();
  },
};

export const WithoutManageAppsPermission: Story = {
  args: { canManageApps: false },
  play: async ({ canvasElement }) => {
    const dialog = within(await findDialog(canvasElement));

    await expect(
      dialog.getByText(
        'Only members who can manage apps can grant access. Ask your workspace administrator.',
      ),
    ).toBeVisible();
    await expect(
      dialog.queryByRole('button', { name: 'Authorize' }),
    ).not.toBeInTheDocument();

    await userEvent.click(dialog.getByRole('button', { name: 'Close' }));

    await expect(resolveRequest).toHaveBeenCalledWith(null);
    await expect(grantRequest).not.toHaveBeenCalled();
  },
};

export const RetriesAfterAFailedGrant: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.mutation('GrantApplicationCapabilities', ({ variables }) => {
          grantRequest(variables.input);

          if (grantRequest.mock.calls.length === 1) {
            return HttpResponse.json(
              { errors: [{ message: 'Save failed' }] },
              { status: 500 },
            );
          }

          return HttpResponse.json(grantResponse);
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const dialog = within(await findDialog(canvasElement));

    await userEvent.click(dialog.getByRole('button', { name: 'Authorize' }));

    await expect(await dialog.findByRole('alert')).toHaveTextContent(
      'Could not grant media access. Please try again.',
    );
    await expect(resolveRequest).not.toHaveBeenCalled();

    await userEvent.click(dialog.getByRole('button', { name: 'Authorize' }));

    await waitFor(async () => {
      await expect(resolveRequest).toHaveBeenCalledWith([
        'microphone',
        'camera',
      ]);
    });
  },
};

export const IgnoresACaptureAbortedWhileSaving: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.mutation(
          'GrantApplicationCapabilities',
          async ({ variables }) => {
            grantRequest(variables.input);
            await delay(100);

            return HttpResponse.json(grantResponse);
          },
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const dialog = within(await findDialog(canvasElement));

    await userEvent.click(dialog.getByRole('button', { name: 'Authorize' }));

    abortController.abort();

    await waitFor(async () => {
      await expect(grantRequest).toHaveBeenCalled();
    });
    await expect(resolveRequest).not.toHaveBeenCalled();
  },
};
