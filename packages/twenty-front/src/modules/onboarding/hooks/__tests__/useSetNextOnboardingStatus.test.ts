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
} from '~/generated-metadata/graphql';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';

const renderHooks = (
  onboardingStatus: OnboardingStatus,
  withCurrentBillingSubscription: boolean,
  withOneWorkspaceMember = true,
  permissionFlags = mockedUserData.currentUserWorkspace.permissionFlags,
) => {
  const { result } = renderHook(
    () => {
      const [currentUser, setCurrentUser] = useRecoilState(currentUserState);
      const setCurrentUserWorkspace = useSetRecoilState(
        currentUserWorkspaceState,
      );
      const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
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
    result.current.setCurrentUserWorkspace({
      ...mockedUserData.currentUserWorkspace,
      permissionFlags,
    });
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
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.SYNC_EMAIL);
  });

  it('should skip SyncEmail when user is not first workspace member', () => {
    const nextOnboardingStatus = renderHooks(
      OnboardingStatus.PROFILE_CREATION,
      false,
      false,
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.COMPLETED);
  });

  it('should skip SyncEmail when account sync is disabled', () => {
    const nextOnboardingStatus = renderHooks(
      OnboardingStatus.PROFILE_CREATION,
      false,
      true,
      [PermissionFlagType.WORKSPACE_MEMBERS],
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.INVITE_TEAM);
  });

  it('should set next onboarding status for SyncEmail', () => {
    const nextOnboardingStatus = renderHooks(
      OnboardingStatus.SYNC_EMAIL,
      false,
      true,
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.INVITE_TEAM);
  });

  it('should skip invite when more than 1 workspaceMember exist', () => {
    const nextOnboardingStatus = renderHooks(
      OnboardingStatus.SYNC_EMAIL,
      true,
      false,
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.COMPLETED);
  });

  it('should set next onboarding status for Completed', () => {
    const nextOnboardingStatus = renderHooks(
      OnboardingStatus.INVITE_TEAM,
      true,
      true,
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.COMPLETED);
  });
});
