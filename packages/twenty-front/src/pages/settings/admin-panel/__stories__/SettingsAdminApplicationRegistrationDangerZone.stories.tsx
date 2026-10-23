import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { ApolloAdminClientContext } from '@/settings/admin-panel/apollo/contexts/ApolloAdminClientContext';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  ApplicationRegistrationSourceType,
  PermissionFlagType,
  type ApplicationRegistration,
  type TransferApplicationRegistrationOwnershipMutation,
  type TransferApplicationRegistrationOwnershipMutationVariables,
} from '~/generated-metadata/graphql';
import { SettingsAdminApplicationRegistrationDangerZone } from '~/pages/settings/admin-panel/SettingsAdminApplicationRegistrationDangerZone';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ToastStoryContainer } from '~/testing/components/ToastStoryContainer';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { mockedApolloClient } from '~/testing/mockedApolloClient';

const REGISTRATION: ApplicationRegistration = {
  id: '20202020-1a2b-4c3d-8e4f-000000000001',
  name: 'Acme app',
  universalIdentifier: 'acme-app',
  oAuthClientId: 'acme-app-client',
  oAuthRedirectUris: [],
  oAuthScopes: [],
  galleryImagesUrls: [],
  sourceType: ApplicationRegistrationSourceType.NPM,
  isConfigured: true,
  isListed: false,
  isPreInstalled: false,
  isVetted: false,
  ownerWorkspaceId: '20202020-1a2b-4c3d-8e4f-000000000002',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const transferOwnershipRequest = fn();
let finishTransferRequest: (() => void) | undefined;

const meta: Meta<typeof SettingsAdminApplicationRegistrationDangerZone> = {
  title:
    'Pages/Settings/AdminPanel/SettingsAdminApplicationRegistrationDangerZone',
  component: SettingsAdminApplicationRegistrationDangerZone,
  args: { registration: REGISTRATION },
  decorators: [
    (Story) => (
      <ApolloAdminClientContext.Provider value={mockedApolloClient}>
        <ToastStoryContainer>
          <Story />
        </ToastStoryContainer>
      </ApolloAdminClientContext.Provider>
    ),
    ToastDecorator,
    MemoryRouterDecorator,
    ComponentDecorator,
  ],
  beforeEach: async () => {
    await mockedApolloClient.clearStore();
    transferOwnershipRequest.mockClear();
    finishTransferRequest = undefined;
    jotaiStore.set(currentUserWorkspaceState.atom, {
      permissionFlags: [PermissionFlagType.APPLICATIONS],
      objectsPermissions: [],
      twoFactorAuthenticationMethodSummary: [],
      isImpersonating: false,
    });

    return () => finishTransferRequest?.();
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindApplicationRegistrationInstallCount', () =>
          HttpResponse.json({
            data: { findApplicationRegistrationStats: { activeInstalls: 0 } },
          }),
        ),
        graphql.mutation<
          TransferApplicationRegistrationOwnershipMutation,
          TransferApplicationRegistrationOwnershipMutationVariables
        >('TransferApplicationRegistrationOwnership', async ({ variables }) => {
          transferOwnershipRequest(variables);
          await new Promise<void>((resolve) => {
            finishTransferRequest = resolve;
          });
          return HttpResponse.json({
            errors: [{ message: 'Transfer failed' }],
          });
        }),
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof SettingsAdminApplicationRegistrationDangerZone>;

export const TransferFailurePreservesInput: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const openTransferButton = canvas.getByRole('button', {
      name: 'Transfer ownership',
    });
    await userEvent.click(openTransferButton);
    const dialog = await body.findByRole('dialog', {
      name: 'Transfer ownership',
    });
    const input = within(dialog).getByRole('textbox', {
      name: 'Target workspace subdomain',
    });
    const transferButton = within(dialog).getByRole('button', {
      name: 'Transfer',
    });

    await waitFor(() => expect(input).toHaveFocus());
    expect(transferButton).toBeDisabled();
    expect(transferButton).toHaveAttribute('data-color', 'danger');
    expect(transferButton).toHaveAttribute('data-variant', 'outline');
    await userEvent.type(input, '   ');
    expect(transferButton).toBeDisabled();
    await userEvent.clear(input);
    await userEvent.type(input, ' target-workspace ');
    await waitFor(() => expect(transferButton).toBeEnabled());
    await userEvent.keyboard('{Enter}');
    expect(transferOwnershipRequest).not.toHaveBeenCalled();
    expect(transferButton).toBeEnabled();
    await userEvent.click(transferButton);
    await waitFor(() =>
      expect(transferOwnershipRequest).toHaveBeenCalledWith({
        applicationRegistrationId: REGISTRATION.id,
        targetWorkspaceSubdomain: 'target-workspace',
      }),
    );
    expect(transferOwnershipRequest).toHaveBeenCalledOnce();
    await waitFor(() => expect(transferButton).toBeDisabled());
    expect(dialog).toBeVisible();

    if (!isDefined(finishTransferRequest)) {
      throw new Error('Transfer request has not started');
    }
    finishTransferRequest();

    await body.findByText(
      'Failed to transfer ownership. Check that the subdomain is correct.',
    );
    await waitFor(() => expect(transferButton).toBeEnabled());
    expect(dialog).toBeVisible();
    expect(input).toHaveValue('target-workspace ');
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Cancel' }),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await userEvent.click(openTransferButton);
    const reopenedDialog = await body.findByRole('dialog', {
      name: 'Transfer ownership',
    });
    const reopenedInput = within(reopenedDialog).getByRole('textbox', {
      name: 'Target workspace subdomain',
    });
    await waitFor(() => expect(reopenedInput).toHaveFocus());
    expect(reopenedInput).toHaveValue('');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(reopenedDialog).not.toBeInTheDocument());
  },
};
