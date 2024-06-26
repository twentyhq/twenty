import { act } from 'react-dom/test-utils';
import { renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { CurrentUser, currentUserState } from '@/auth/states/currentUserState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { OnboardingStatus } from '~/generated/graphql';

const tokenPair = {
  accessToken: { token: 'accessToken', expiresAt: 'expiresAt' },
  refreshToken: { token: 'refreshToken', expiresAt: 'expiresAt' },
};
const currentUser = {
  id: '1',
  onboardingStatus: null,
} as CurrentUser;

const renderHooks = () => {
  const { result } = renderHook(
    () => {
      const onboardingStatus = useOnboardingStatus();
      const setCurrentUser = useSetRecoilState(currentUserState);
      const setTokenPair = useSetRecoilState(tokenPairState);

      return {
        onboardingStatus,
        setCurrentUser,
        setTokenPair,
      };
    },
    {
      wrapper: RecoilRoot,
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
