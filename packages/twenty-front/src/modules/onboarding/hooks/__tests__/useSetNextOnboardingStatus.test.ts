import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilState, useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import {
  OnboardingStatus,
  PermissionFlagType,
  SubscriptionStatus,
} from '~/generated/graphql';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';

const renderHooks = (
  onboardingStatus: OnboardingStatus,
  withCurrentBillingSubscription: boolean,
  withOneWorkspaceMember = true,
  hasConnectedAccountsPermission = true,
) => {
  const { result } = renderHook(
    () => {
      const [currentUser, setCurrentUser] = useRecoilState(currentUserState);
      const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
      const setCurrentUserWorkspace = useSetRecoilState(
        currentUserWorkspaceState,
      );
      const setNextOnboardingStatus = useSetNextOnboardingStatus();
      return {
        currentUser,
        setCurrentUser,
        setCurrentWorkspace,
        setCurrentUserWorkspace,
        setNextOnboardingStatus,
      };
    },
    {
      wrapper: RecoilRoot,
    },
  );
  act(() => {
    result.current.setCurrentUser({ ...mockedUserData, onboardingStatus });
    result.current.setCurrentWorkspace({
      ...mockCurrentWorkspace,
      currentBillingSubscription: withCurrentBillingSubscription
        ? {
            id: v4(),
            status: SubscriptionStatus.Active,
            metadata: {},
            phases: [],
          }
        : undefined,
      workspaceMembersCount: withOneWorkspaceMember ? 1 : 2,
    });
    result.current.setCurrentUserWorkspace({
      permissionFlags: hasConnectedAccountsPermission
        ? [PermissionFlagType.CONNECTED_ACCOUNTS]
        : [],
      twoFactorAuthenticationMethodSummary: null,
      objectsPermissions: [],
    });
  });
  act(() => {
    result.current.setNextOnboardingStatus();
  });
  return result.current.currentUser?.onboardingStatus;
};

describe('useSetNextOnboardingStatus', () => {
  it('should set next onboarding status for ProfileCreation', () => {
    const nextOnboardingStatus = renderHooks(
      OnboardingStatus.PROFILE_CREATION,
      false,
      true,
      true,
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.SYNC_EMAIL);
  });

  it('should skip SyncEmail when user is not first workspace member', () => {
    const nextOnboardingStatus = renderHooks(
      OnboardingStatus.PROFILE_CREATION,
      false,
      false,
      true,
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.COMPLETED);
  });

  it('should skip SyncEmail when user does not have CONNECTED_ACCOUNTS permission', () => {
    const nextOnboardingStatus = renderHooks(
      OnboardingStatus.PROFILE_CREATION,
      false,
      true,
      false,
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.INVITE_TEAM);
  });

  it('should set next onboarding status for SyncEmail', () => {
    const nextOnboardingStatus = renderHooks(
      OnboardingStatus.SYNC_EMAIL,
      false,
      true,
      true,
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.INVITE_TEAM);
  });

  it('should skip invite when more than 1 workspaceMember exist', () => {
    const nextOnboardingStatus = renderHooks(
      OnboardingStatus.SYNC_EMAIL,
      true,
      false,
      true,
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.COMPLETED);
  });

  it('should set next onboarding status for Completed', () => {
    const nextOnboardingStatus = renderHooks(
      OnboardingStatus.INVITE_TEAM,
      true,
      true,
      true,
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.COMPLETED);
  });
});
