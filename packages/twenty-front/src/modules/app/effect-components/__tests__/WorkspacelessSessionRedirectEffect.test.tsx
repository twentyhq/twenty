import { render, waitFor } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { WorkspacelessSessionRedirectEffect } from '@/app/effect-components/WorkspacelessSessionRedirectEffect';
import {
  type CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const navigateMock = jest.fn();
let hasAccessTokenPairValue = true;

jest.mock('@/auth/hooks/useHasAccessTokenPair', () => ({
  useHasAccessTokenPair: () => hasAccessTokenPairValue,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => navigateMock,
}));

const activeWorkspace = {
  activationStatus: WorkspaceActivationStatus.ACTIVE,
} as CurrentWorkspace;

const renderEffect = (initialEntry: string) =>
  render(
    <JotaiProvider store={jotaiStore}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <WorkspacelessSessionRedirectEffect />
      </MemoryRouter>
    </JotaiProvider>,
  );

describe('WorkspacelessSessionRedirectEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    hasAccessTokenPairValue = true;
    jotaiStore.set(isCurrentUserLoadedState.atom, true);
    jotaiStore.set(currentWorkspaceState.atom, null);
  });

  it('redirects an authenticated workspace-less session to SignInUp', async () => {
    renderEffect('/');

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith(AppPath.SignInUp);
    });
  });

  it('does not redirect a session that has an active workspace', () => {
    jotaiStore.set(currentWorkspaceState.atom, activeWorkspace);

    renderEffect('/');

    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('does not redirect before the current user has finished loading', () => {
    jotaiStore.set(isCurrentUserLoadedState.atom, false);

    renderEffect('/');

    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('does not redirect an unauthenticated session', () => {
    hasAccessTokenPairValue = false;

    renderEffect('/');

    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('does not redirect when already on the SignInUp page', () => {
    renderEffect(AppPath.SignInUp);

    expect(navigateMock).not.toHaveBeenCalled();
  });
});
