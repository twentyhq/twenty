import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { type ComponentProps } from 'react';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { type ImportContacts } from '~/pages/onboarding/ImportContacts';
import { SyncEmails } from '~/pages/onboarding/SyncEmails';

const mockSkipSyncEmailOnboardingStep = jest.fn();
const mockTriggerApisOAuth = jest.fn();

jest.mock('@/onboarding/hooks/useSkipSyncEmailOnboardingStep', () => ({
  useSkipSyncEmailOnboardingStep: () => mockSkipSyncEmailOnboardingStep,
}));

jest.mock('@/settings/accounts/hooks/useTriggerApiOAuth', () => ({
  useTriggerApisOAuth: () => ({ triggerApisOAuth: mockTriggerApisOAuth }),
}));

jest.mock('~/pages/onboarding/ImportContacts', () => ({
  ImportContacts: ({
    onContinueWithGoogle,
    onContinueWithMicrosoft,
    onSkip,
  }: ComponentProps<typeof ImportContacts>) => (
    <div>
      {isDefined(onContinueWithGoogle) && (
        <button onClick={onContinueWithGoogle}>Continue with Google</button>
      )}
      {isDefined(onContinueWithMicrosoft) && (
        <button onClick={onContinueWithMicrosoft}>
          Continue with Microsoft
        </button>
      )}
      <button onClick={onSkip}>Skip</button>
    </div>
  ),
}));

const renderPage = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <SyncEmails />
    </JotaiProvider>,
  );

describe('SyncEmails', () => {
  beforeEach(() => {
    localStorage.clear();
    resetJotaiStore();
    jest.resetAllMocks();
    mockSkipSyncEmailOnboardingStep.mockResolvedValue(undefined);
    jotaiStore.set(clientConfigApiStatusState.atom, {
      isLoadedOnce: true,
      isLoading: false,
      isErrored: false,
      isSaved: false,
    });
    jotaiStore.set(isGoogleMessagingEnabledState.atom, true);
    jotaiStore.set(isMicrosoftMessagingEnabledState.atom, true);
    jotaiStore.set(currentUserWorkspaceState.atom, {
      permissionFlags: [],
      objectsPermissions: [],
      twoFactorAuthenticationMethodSummary: [],
      isImpersonating: false,
    });
  });

  it('automatically skips account syncing for a role without permission', async () => {
    renderPage();

    expect(
      screen.queryByRole('button', { name: 'Continue with Google' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Continue with Microsoft' }),
    ).not.toBeInTheDocument();
    await waitFor(() => {
      expect(mockSkipSyncEmailOnboardingStep).toHaveBeenCalledWith({
        isAutoSkipped: true,
      });
    });
    expect(mockTriggerApisOAuth).not.toHaveBeenCalled();
  });

  it('keeps provider actions hidden if automatic skipping fails', async () => {
    mockSkipSyncEmailOnboardingStep.mockRejectedValueOnce(
      new Error('Unable to skip onboarding'),
    );
    const user = userEvent.setup();

    renderPage();

    const skipButton = await screen.findByRole('button', { name: 'Skip' });

    expect(
      screen.queryByRole('button', { name: 'Continue with Google' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Continue with Microsoft' }),
    ).not.toBeInTheDocument();

    await user.click(skipButton);

    expect(mockSkipSyncEmailOnboardingStep).toHaveBeenLastCalledWith({
      isAutoSkipped: false,
    });
    expect(mockTriggerApisOAuth).not.toHaveBeenCalled();
  });

  it.each([
    { name: 'Google', provider: ConnectedAccountProvider.GOOGLE },
    { name: 'Microsoft', provider: ConnectedAccountProvider.MICROSOFT },
  ])(
    'allows permitted users to connect with $name',
    async ({ name, provider }) => {
      jotaiStore.set(currentUserWorkspaceState.atom, {
        ...jotaiStore.get(currentUserWorkspaceState.atom)!,
        permissionFlags: [PermissionFlagType.CONNECTED_ACCOUNTS],
      });
      const user = userEvent.setup();

      renderPage();

      await user.click(
        screen.getByRole('button', { name: `Continue with ${name}` }),
      );

      expect(mockTriggerApisOAuth).toHaveBeenCalledWith(
        provider,
        expect.any(Object),
      );
      expect(mockSkipSyncEmailOnboardingStep).not.toHaveBeenCalled();
    },
  );

  it('waits for workspace permissions before deciding whether to skip', () => {
    const currentUserWorkspace = jotaiStore.get(
      currentUserWorkspaceState.atom,
    )!;

    jotaiStore.set(currentUserWorkspaceState.atom, null);

    renderPage();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(mockSkipSyncEmailOnboardingStep).not.toHaveBeenCalled();

    act(() => {
      jotaiStore.set(currentUserWorkspaceState.atom, {
        ...currentUserWorkspace,
        permissionFlags: [PermissionFlagType.CONNECTED_ACCOUNTS],
      });
    });

    expect(
      screen.getByRole('button', { name: 'Continue with Google' }),
    ).toBeInTheDocument();
    expect(mockSkipSyncEmailOnboardingStep).not.toHaveBeenCalled();
  });
});
