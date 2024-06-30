import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilState, useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { OnboardingStatus, SubscriptionStatus } from '~/generated/graphql';
import {
  mockDefaultWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: jest.fn(),
}));
const setupMockWorkspaceMembers = (withManyWorkspaceMembers = false) => {
  jest
    .requireMock('@/object-record/hooks/useFindManyRecords')
    .useFindManyRecords.mockReturnValue({
      records: withManyWorkspaceMembers ? [{}, {}] : [{}],
    });
};

const renderHooks = (
  onboardingStatus: OnboardingStatus,
  withCurrentBillingSubscription: boolean,
) => {
  const { result } = renderHook(
    () => {
      const [currentUser, setCurrentUser] = useRecoilState(currentUserState);
      const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
      const setNextOnboardingStatus = useSetNextOnboardingStatus();
      return {
        currentUser,
        setCurrentUser,
        setCurrentWorkspace,
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
      ...mockDefaultWorkspace,
      currentBillingSubscription: withCurrentBillingSubscription
        ? { id: v4(), status: SubscriptionStatus.Active }
        : undefined,
    });
  });
  act(() => {
    result.current.setNextOnboardingStatus();
  });
  return result.current.currentUser?.onboardingStatus;
};

describe('useSetNextOnboardingStatus', () => {
  it('should set next onboarding status for ProfileCreation', () => {
    setupMockWorkspaceMembers();
    const nextOnboardingStatus = renderHooks(
      OnboardingStatus.ProfileCreation,
      false,
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.SyncEmail);
  });

  it('should set next onboarding status for SyncEmail', () => {
    setupMockWorkspaceMembers();
    const nextOnboardingStatus = renderHooks(OnboardingStatus.SyncEmail, false);
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.InviteTeam);
  });

  it('should skip invite when workspaceMembers exist', () => {
    setupMockWorkspaceMembers(true);
    const nextOnboardingStatus = renderHooks(OnboardingStatus.SyncEmail, true);
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.Completed);
  });

  it('should set next onboarding status for Completed', () => {
    setupMockWorkspaceMembers();
    const nextOnboardingStatus = renderHooks(OnboardingStatus.InviteTeam, true);
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.Completed);
  });
});
