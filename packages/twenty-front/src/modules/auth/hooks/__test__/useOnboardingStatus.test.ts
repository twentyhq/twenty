import { act } from 'react-dom/test-utils';
import { renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { CurrentUser, currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import {
  CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import { isVerifyPendingState } from '@/auth/states/isVerifyPendingState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { billingState } from '@/client-config/states/billingState';
import { OnboardingStep } from '~/generated/graphql';

const tokenPair = {
  accessToken: { token: 'accessToken', expiresAt: 'expiresAt' },
  refreshToken: { token: 'refreshToken', expiresAt: 'expiresAt' },
};
const billing = {
  billingUrl: 'testing.com',
  isBillingEnabled: true,
};
const currentUser = {
  id: '1',
  email: 'test@test',
  supportUserHash: '1',
  canImpersonate: false,
  onboardingStep: null,
} as CurrentUser;
const currentWorkspace = {
  activationStatus: 'active',
  id: '1',
  allowImpersonation: true,
  currentBillingSubscription: {
    status: 'trialing',
  },
} as CurrentWorkspace;
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
      const setCurrentUser = useSetRecoilState(currentUserState);
      const setTokenPair = useSetRecoilState(tokenPairState);
      const setVerifyPending = useSetRecoilState(isVerifyPendingState);

      return {
        onboardingStatus,
        setBilling,
        setCurrentUser,
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
      setCurrentUser,
      setCurrentWorkspace,
      setCurrentWorkspaceMember,
    } = result.current;

    act(() => {
      setTokenPair(tokenPair);
      setBilling(billing);
      setCurrentUser(currentUser);
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
      setCurrentUser,
      setCurrentWorkspace,
      setCurrentWorkspaceMember,
    } = result.current;

    act(() => {
      setTokenPair(tokenPair);
      setBilling(billing);
      setCurrentUser(currentUser);
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
    const { setTokenPair, setBilling, setCurrentUser, setCurrentWorkspace } =
      result.current;

    act(() => {
      setTokenPair(tokenPair);
      setBilling(billing);
      setCurrentUser(currentUser);
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
      setCurrentUser,
      setCurrentWorkspace,
      setCurrentWorkspaceMember,
    } = result.current;

    act(() => {
      setTokenPair(tokenPair);
      setBilling(billing);
      setCurrentUser(currentUser);
      setCurrentWorkspace({
        ...currentWorkspace,
        subscriptionStatus: 'active',
      });
      setCurrentWorkspaceMember(currentWorkspaceMember);
    });

    expect(result.current.onboardingStatus).toBe('ongoing_profile_creation');
  });

  it('should return "ongoing_sync_email"', async () => {
    const { result } = renderHooks();
    const {
      setTokenPair,
      setBilling,
      setCurrentUser,
      setCurrentWorkspace,
      setCurrentWorkspaceMember,
    } = result.current;

    act(() => {
      setTokenPair(tokenPair);
      setBilling(billing);
      setCurrentUser({
        ...currentUser,
        onboardingStep: OnboardingStep.SyncEmail,
      });
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

    expect(result.current.onboardingStatus).toBe('ongoing_sync_email');
  });

  it('should return "ongoing_invite_team"', async () => {
    const { result } = renderHooks();
    const {
      setTokenPair,
      setBilling,
      setCurrentUser,
      setCurrentWorkspace,
      setCurrentWorkspaceMember,
    } = result.current;

    act(() => {
      setTokenPair(tokenPair);
      setBilling(billing);
      setCurrentUser({
        ...currentUser,
        onboardingStep: OnboardingStep.InviteTeam,
      });
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

    expect(result.current.onboardingStatus).toBe('ongoing_invite_team');
  });

  it('should return "completed"', async () => {
    const { result } = renderHooks();
    const {
      setTokenPair,
      setBilling,
      setCurrentUser,
      setCurrentWorkspace,
      setCurrentWorkspaceMember,
    } = result.current;

    act(() => {
      setTokenPair(tokenPair);
      setBilling(billing);
      setCurrentUser(currentUser);
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
      setCurrentUser,
      setCurrentWorkspace,
      setCurrentWorkspaceMember,
    } = result.current;

    act(() => {
      setTokenPair(tokenPair);
      setBilling(billing);
      setCurrentUser(currentUser);
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
      setCurrentUser,
      setCurrentWorkspace,
      setCurrentWorkspaceMember,
    } = result.current;

    act(() => {
      setTokenPair(tokenPair);
      setBilling(billing);
      setCurrentUser(currentUser);
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
      setCurrentUser,
      setCurrentWorkspace,
      setCurrentWorkspaceMember,
    } = result.current;

    act(() => {
      setTokenPair(tokenPair);
      setBilling(billing);
      setCurrentUser(currentUser);
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
