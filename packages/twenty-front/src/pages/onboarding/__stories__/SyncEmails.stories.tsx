import { getOperationName } from '~/utils/getOperationName';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { AppPath } from 'twenty-shared/types';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { SKIP_SYNC_EMAIL_ONBOARDING_STEP } from '@/onboarding/graphql/mutations/skipSyncEmailOnboardingStep';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  OnboardingStatus,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { GET_CURRENT_USER } from '~/modules/users/graphql/queries/getCurrentUser';
import { SyncEmails } from '~/pages/onboarding/SyncEmails';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedApolloClient } from '~/testing/mockedApolloClient';
import {
  mockCurrentWorkspace,
  mockedOnboardingUserData,
} from '~/testing/mock-data/users';

const skipSyncEmailRequest = fn();
let finishLoadingPermissions: (() => void) | undefined;

const buildHandlers = ({
  workspaceMembersCount = 1,
  permissionFlags = [PermissionFlagType.CONNECTED_ACCOUNTS],
  shouldFailAutoSkip = false,
  shouldWaitForPermissions = false,
}: {
  workspaceMembersCount?: number;
  permissionFlags?: PermissionFlagType[];
  shouldFailAutoSkip?: boolean;
  shouldWaitForPermissions?: boolean;
} = {}) => [
  graphql.query(getOperationName(GET_CURRENT_USER) ?? '', async () => {
    if (shouldWaitForPermissions) {
      await new Promise<void>((resolve) => {
        finishLoadingPermissions = resolve;
      });
    }

    const currentUser = mockedOnboardingUserData(OnboardingStatus.SYNC_EMAIL);

    return HttpResponse.json({
      data: {
        currentUser: {
          ...currentUser,
          currentWorkspace: {
            ...mockCurrentWorkspace,
            workspaceMembersCount,
          },
          currentUserWorkspace: {
            ...currentUser.currentUserWorkspace,
            permissionFlags,
          },
        },
      },
    });
  }),
  graphql.mutation(
    getOperationName(SKIP_SYNC_EMAIL_ONBOARDING_STEP) ?? '',
    ({ variables }) => {
      skipSyncEmailRequest(variables);

      if (shouldFailAutoSkip && variables.isAutoSkipped) {
        return HttpResponse.json({
          errors: [{ message: 'Unable to skip onboarding' }],
        });
      }

      return HttpResponse.json({
        data: { skipSyncEmailOnboardingStep: { success: true } },
      });
    },
  ),
  graphqlMocks.handlers,
];

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Onboarding/SyncEmails',
  component: SyncEmails,
  decorators: [PageDecorator],
  args: { routePath: AppPath.SyncEmails },
  beforeEach: async () => {
    await mockedApolloClient.clearStore();
    jotaiStore.set(isCookieAuthActiveState.atom, true);
    jotaiStore.set(isCurrentUserLoadedState.atom, false);
    jotaiStore.set(currentUserWorkspaceState.atom, null);
    skipSyncEmailRequest.mockClear();
    finishLoadingPermissions = undefined;

    return () => finishLoadingPermissions?.();
  },
  parameters: {
    msw: {
      handlers: buildHandlers(),
    },
  },
};

export default meta;

type Story = StoryObj<typeof SyncEmails>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await canvas.findByText('Import your contacts');
    await canvas.findByText('Earn +2');
  },
};

export const InvitedUser: Story = {
  parameters: {
    msw: { handlers: buildHandlers({ workspaceMembersCount: 2 }) },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await canvas.findByText('Import your contacts');
    await canvas.findByRole('button', { name: 'Continue with Google' });
    await canvas.findByRole('button', { name: 'Continue with Microsoft' });
    expect(canvas.queryByText('Earn +2')).not.toBeInTheDocument();
    expect(jotaiStore.get(currentUserState.atom)?.onboardingStatus).toBe(
      OnboardingStatus.SYNC_EMAIL,
    );
  },
};

export const WithoutConnectedAccountsPermission: Story = {
  parameters: {
    msw: {
      handlers: buildHandlers({
        workspaceMembersCount: 2,
        permissionFlags: [],
      }),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await waitFor(() =>
      expect(jotaiStore.get(currentUserState.atom)?.onboardingStatus).toBe(
        OnboardingStatus.PROFILE_CREATION,
      ),
    );
    expect(
      canvas.queryByRole('button', { name: 'Continue with Google' }),
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByRole('button', { name: 'Continue with Microsoft' }),
    ).not.toBeInTheDocument();
    expect(
      jotaiStore.get(currentUserState.atom)?.previousOnboardingStatus,
    ).not.toBe(OnboardingStatus.SYNC_EMAIL);
    expect(skipSyncEmailRequest).toHaveBeenCalledWith({ isAutoSkipped: true });
  },
};

export const AutoSkipFailed: Story = {
  parameters: {
    msw: {
      handlers: buildHandlers({
        workspaceMembersCount: 2,
        permissionFlags: [],
        shouldFailAutoSkip: true,
      }),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const skipButton = await canvas.findByRole('button', { name: 'Skip' });

    expect(
      canvas.queryByRole('button', { name: 'Continue with Google' }),
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByRole('button', { name: 'Continue with Microsoft' }),
    ).not.toBeInTheDocument();

    await userEvent.click(skipButton);

    await waitFor(() =>
      expect(jotaiStore.get(currentUserState.atom)?.onboardingStatus).toBe(
        OnboardingStatus.PROFILE_CREATION,
      ),
    );
    expect(skipSyncEmailRequest).toHaveBeenLastCalledWith({
      isAutoSkipped: false,
    });
  },
};

export const PermissionsLoading: Story = {
  parameters: {
    msw: {
      handlers: buildHandlers({
        workspaceMembersCount: 2,
        shouldWaitForPermissions: true,
      }),
    },
  },
  beforeEach: () => {
    jotaiStore.set(currentUserWorkspaceState.atom, {
      permissionFlags: [],
      objectsPermissions: [],
      twoFactorAuthenticationMethodSummary: [],
      isImpersonating: false,
    });
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await waitFor(() => {
      expect(finishLoadingPermissions).toBeDefined();
      expect(jotaiStore.get(clientConfigApiStatusState.atom).isLoadedOnce).toBe(
        true,
      );
    });
    expect(
      canvas.queryByRole('button', { name: 'Continue with Google' }),
    ).not.toBeInTheDocument();
    expect(skipSyncEmailRequest).not.toHaveBeenCalled();

    finishLoadingPermissions?.();

    await canvas.findByRole('button', { name: 'Continue with Google' });
    expect(skipSyncEmailRequest).not.toHaveBeenCalled();
  },
};
