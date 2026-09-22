import { render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

import { lastAuthenticatedMethodState } from '@/auth/states/lastAuthenticatedMethodState';
import { SignInUpDosIdAutoRedirectEffect } from '@/auth/sign-in-up/components/internal/SignInUpDosIdAutoRedirectEffect';
import { useSignInWithDosId } from '@/auth/sign-in-up/hooks/useSignInWithDosId';
import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';

jest.mock('@/auth/sign-in-up/hooks/useSignInWithDosId');
jest.mock('@/domain-manager/hooks/useIsCurrentLocationOnDefaultDomain', () => ({
  useIsCurrentLocationOnDefaultDomain: () => ({ isDefaultDomain: true }),
}));

const mockUseSignInWithDosId = useSignInWithDosId as jest.Mock;

type EffectProps = {
  hasWorkspaceSso?: boolean;
  isWorkspacePublicDataLoading?: boolean;
};

const renderEffect = (search = '', props: EffectProps = {}) =>
  render(
    <MemoryRouter initialEntries={[`/welcome${search}`]}>
      <JotaiProvider store={jotaiStore}>
        <SignInUpDosIdAutoRedirectEffect
          hasWorkspaceSso={props.hasWorkspaceSso ?? false}
          isWorkspacePublicDataLoading={
            props.isWorkspacePublicDataLoading ?? false
          }
        />
      </JotaiProvider>
    </MemoryRouter>,
  );

describe('SignInUpDosIdAutoRedirectEffect', () => {
  const signInWithDosId = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    sessionStorage.clear();
    jotaiStore.set(authProvidersState.atom, {
      google: false,
      magicLink: false,
      password: false,
      microsoft: false,
      dosId: true,
      sso: [],
    });
    jotaiStore.set(clientConfigApiStatusState.atom, {
      isSaved: false,
      isLoading: false,
      isLoadedOnce: true,
      isErrored: false,
    });
    jotaiStore.set(isMultiWorkspaceEnabledState.atom, true);
    jotaiStore.set(signInUpStepState.atom, SignInUpStep.Init);
    jotaiStore.set(isCookieAuthActiveState.atom, false);
    mockUseSignInWithDosId.mockReturnValue({ signInWithDosId });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('redirects to DOS ID when it is the only transport', () => {
    renderEffect();

    expect(signInWithDosId).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'list-available-workspaces' }),
    );
    expect(jotaiStore.get(lastAuthenticatedMethodState.atom)).toBeDefined();
  });

  it('does not redirect when another transport is enabled', () => {
    jotaiStore.set(authProvidersState.atom, {
      google: false,
      magicLink: false,
      password: true,
      microsoft: false,
      dosId: true,
      sso: [],
    });

    renderEffect();

    expect(signInWithDosId).not.toHaveBeenCalled();
  });

  it('does not redirect while the workspace has SSO configured', () => {
    renderEffect('', { hasWorkspaceSso: true });

    expect(signInWithDosId).not.toHaveBeenCalled();
  });

  it('does not redirect while workspace public data is still loading', () => {
    renderEffect('', { isWorkspacePublicDataLoading: true });

    expect(signInWithDosId).not.toHaveBeenCalled();
  });

  it('does not redirect when the IdP bounced back with an errorMessage', () => {
    renderEffect('?errorMessage=Something%20broke');

    expect(signInWithDosId).not.toHaveBeenCalled();
  });

  it('does not redirect on the break-glass direct=1 entry point', () => {
    renderEffect('?direct=1');

    expect(signInWithDosId).not.toHaveBeenCalled();
  });

  it('does not redirect when a flow is already past Init', () => {
    jotaiStore.set(signInUpStepState.atom, SignInUpStep.WorkspaceSelection);

    renderEffect();

    expect(signInWithDosId).not.toHaveBeenCalled();
  });

  it('does not redirect while the client config has not loaded', () => {
    jotaiStore.set(clientConfigApiStatusState.atom, {
      isSaved: false,
      isLoading: true,
      isLoadedOnce: false,
      isErrored: false,
    });

    renderEffect();

    expect(signInWithDosId).not.toHaveBeenCalled();
  });

  it('suppresses a remounted attempt within the cooldown', () => {
    renderEffect();
    renderEffect();

    expect(signInWithDosId).toHaveBeenCalledTimes(1);
    expect(
      Number(sessionStorage.getItem('dos-id-auto-redirect-attempted-at')),
    ).toBeGreaterThan(0);
  });

  it('redirects again once the cooldown has expired', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:00:00Z'));

    renderEffect();

    expect(signInWithDosId).toHaveBeenCalledTimes(1);

    // A bounce landing back on /welcome within the cooldown stays put...
    jest.setSystemTime(new Date('2026-01-01T00:00:10Z'));
    renderEffect();

    expect(signInWithDosId).toHaveBeenCalledTimes(1);

    // ...but a much later arrival (new tab, next day) retries the redirect.
    jest.setSystemTime(new Date('2026-01-01T00:05:00Z'));
    renderEffect();

    expect(signInWithDosId).toHaveBeenCalledTimes(2);
  });
});
