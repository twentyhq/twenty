import { renderHook } from '@testing-library/react';
import { createElement, act } from 'react';
import { Provider as JotaiProvider } from 'jotai';
import {
  type CurrentUser,
  currentUserState,
} from '@/auth/states/currentUserState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { OnboardingStatus } from '~/generated-metadata/graphql';

const tokenPair = {
  accessOrWorkspaceAgnosticToken: {
    token: 'accessToken',
    expiresAt: 'expiresAt',
  },
  refreshToken: { token: 'refreshToken', expiresAt: 'expiresAt' },
};
const currentUser = {
  id: '1',
  onboardingStatus: null,
} as CurrentUser;

const Wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(JotaiProvider, { store: jotaiStore }, children);

const renderHooks = () => {
  const { result } = renderHook(
    () => {
      const onboardingStatus = useOnboardingStatus();
      const setCurrentUser = useSetAtomState(currentUserState);
      const setTokenPair = useSetAtomState(tokenPairState);

      return {
        onboardingStatus,
        setCurrentUser,
        setTokenPair,
      };
    },
    {
      wrapper: Wrapper,
    },
  );
  return { result };
};

describe('useOnboardingStatus', () => {
  it(`should return "undefined" when user is not logged in`, async () => {
    const { result } = renderHooks();
    expect(result.current.onboardingStatus).toBe(undefined);
  });

  Object.values(OnboardingStatus).forEach((onboardingStatus) => {
    it(`should return "${onboardingStatus}"`, async () => {
      const { result } = renderHooks();
      const { setTokenPair, setCurrentUser } = result.current;

      act(() => {
        setTokenPair(tokenPair);
        setCurrentUser({
          ...currentUser,
          onboardingStatus,
        });
      });

      expect(result.current.onboardingStatus).toBe(onboardingStatus);
    });
  });
});
