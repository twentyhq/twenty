import { act } from 'react-dom/test-utils';
import { renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isVerifyPendingState } from '@/auth/states/isVerifyPendingState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { billingState } from '@/client-config/states/billingState';

const tokenPair = {
  accessToken: { token: 'accessToken', expiresAt: 'expiresAt' },
  refreshToken: { token: 'refreshToken', expiresAt: 'expiresAt' },
};
const billing = {
  billingUrl: 'testing.com',
  isBillingEnabled: true,
};
const currentWorkspace = {
  activationStatus: 'active',
  id: '1',
  allowImpersonation: true,
  currentBillingSubscription: {
    status: 'trialing',
  },
};
const currentWorkspaceMember = {
  id: '1',
  locale: '',
  name: {
    firstName: '',
    lastName: '',
  },
};

const renderHooks = () => {
  const { result } = renderHook(
    () => {
      const onboardingStatus = useOnboardingStatus();
      const setBilling = useSetRecoilState(billingState);
      const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
      const setCurrentWorkspaceMember = useSetRecoilState(
        currentWorkspaceMemberState,
      );
      const setTokenPair = useSetRecoilState(tokenPairState);
      const setVerifyPending = useSetRecoilState(isVerifyPendingState);

      return {
        onboardingStatus,
        setBilling,
        setCurrentWorkspace,
        setCurrentWorkspaceMember,
        setTokenPair,
        setVerifyPending,
      };
    },
    {
      wrapper: RecoilRoot,
    },
  );
  return { result };
};

describe('useOnboardingStatus', () => {
  it('should return "ongoing_user_creation" when user is not logged in', async () => {
    const { result } = renderHooks();

    expect(result.current.onboardingStatus).toBe('ongoing_user_creation');
  });

  it('should return "incomplete"', async () => {
    const { result } = renderHooks();
    const {
      setTokenPair,
      setBilling,
      setCurrentWorkspace,
      setCurrentWorkspaceMember,
    } = result.current;

    act(() => {
      setTokenPair(tokenPair);
      setBilling(billing);
      setCurrentWorkspace({
        ...currentWorkspace,
        subscriptionStatus: 'incomplete',
      });
      setCurrentWorkspaceMember(currentWorkspaceMember);
    });

    expect(result.current.onboardingStatus).toBe('incomplete');
  });

  it('should return "canceled"', async () => {
    const { result } = renderHooks();
    const {
      setTokenPair,
      setBilling,
      setCurrentWorkspace,
      setCurrentWorkspaceMember,
    } = result.current;

    act(() => {
      setTokenPair(tokenPair);
      setBilling(billing);
      setCurrentWorkspace({
        ...currentWorkspace,
        subscriptionStatus: 'canceled',
      });
      setCurrentWorkspaceMember({
        ...currentWorkspaceMember,
        name: {
          firstName: 'John',
          lastName: 'Doe',
        },
      });
    });

    expect(result.current.onboardingStatus).toBe('canceled');
  });

  it('should return "ongoing_workspace_activation"', async () => {
    const { result } = renderHooks();
    const { setTokenPair, setBilling, setCurrentWorkspace } = result.current;

    act(() => {
      setTokenPair(tokenPair);
      setBilling(billing);
      setCurrentWorkspace({
        ...currentWorkspace,
        activationStatus: 'inactive',
        subscriptionStatus: 'active',
      });
    });

    expect(result.current.onboardingStatus).toBe(
      'ongoing_workspace_activation',
    );
  });

  it('should return "ongoing_profile_creation"', async () => {
    const { result } = renderHooks();
    const {
      setTokenPair,
      setBilling,
      setCurrentWorkspace,
      setCurrentWorkspaceMember,
    } = result.current;

    act(() => {
      setTokenPair(tokenPair);
      setBilling(billing);
      setCurrentWorkspace({
        ...currentWorkspace,
        subscriptionStatus: 'active',
      });
      setCurrentWorkspaceMember(currentWorkspaceMember);
    });

    expect(result.current.onboardingStatus).toBe('ongoing_profile_creation');
  });

  it('should return "completed"', async () => {
    const { result } = renderHooks();
    const {
      setTokenPair,
      setBilling,
      setCurrentWorkspace,
      setCurrentWorkspaceMember,
    } = result.current;

    act(() => {
      setTokenPair(tokenPair);
      setBilling(billing);
      setCurrentWorkspace({
        ...currentWorkspace,
        subscriptionStatus: 'active',
      });
      setCurrentWorkspaceMember({
        ...currentWorkspaceMember,
        name: {
          firstName: 'John',
          lastName: 'Doe',
        },
      });
    });

    expect(result.current.onboardingStatus).toBe('completed');
  });

  it('should return "past_due"', async () => {
    const { result } = renderHooks();
    const {
      setTokenPair,
      setBilling,
      setCurrentWorkspace,
      setCurrentWorkspaceMember,
    } = result.current;

    act(() => {
      setTokenPair(tokenPair);
      setBilling(billing);
      setCurrentWorkspace({
        ...currentWorkspace,
        subscriptionStatus: 'past_due',
      });
      setCurrentWorkspaceMember({
        ...currentWorkspaceMember,
        name: {
          firstName: 'John',
          lastName: 'Doe',
        },
      });
    });

    expect(result.current.onboardingStatus).toBe('past_due');
  });

  it('should return "unpaid"', async () => {
    const { result } = renderHooks();
    const {
      setTokenPair,
      setBilling,
      setCurrentWorkspace,
      setCurrentWorkspaceMember,
    } = result.current;

    act(() => {
      setTokenPair(tokenPair);
      setBilling(billing);
      setCurrentWorkspace({
        ...currentWorkspace,
        subscriptionStatus: 'unpaid',
      });
      setCurrentWorkspaceMember({
        ...currentWorkspaceMember,
        name: {
          firstName: 'John',
          lastName: 'Doe',
        },
      });
    });

    expect(result.current.onboardingStatus).toBe('unpaid');
  });

  it('should return "completed_without_subscription"', async () => {
    const { result } = renderHooks();
    const {
      setTokenPair,
      setBilling,
      setCurrentWorkspace,
      setCurrentWorkspaceMember,
    } = result.current;

    act(() => {
      setTokenPair(tokenPair);
      setBilling(billing);
      setCurrentWorkspace({
        ...currentWorkspace,
        subscriptionStatus: 'trialing',
        currentBillingSubscription: null,
      });
      setCurrentWorkspaceMember({
        ...currentWorkspaceMember,
        name: {
          firstName: 'John',
          lastName: 'Doe',
        },
      });
    });

    expect(result.current.onboardingStatus).toBe(
      'completed_without_subscription',
    );
  });
});
