import { renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue, useSetRecoilState } from 'recoil';
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

const renderHooks = (
  onboardingStatus: OnboardingStatus,
  withCurrentBillingSubscription: boolean,
  withManyWorkspaceMembers: boolean,
) => {
  const { result } = renderHook(
    () => {
      const useFindManyRecordsMock = jest.requireMock(
        '@/object-record/hooks/useFindManyRecords',
      );
      useFindManyRecordsMock.useFindManyRecords.mockReturnValue({
        records: withManyWorkspaceMembers ? [{}, {}] : [{}],
      });
      const setCurrentUser = useSetRecoilState(currentUserState);
      const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
      setCurrentUser({ ...mockedUserData, onboardingStatus });
      setCurrentWorkspace({
        ...mockDefaultWorkspace,
        currentBillingSubscription: withCurrentBillingSubscription
          ? { id: v4(), status: SubscriptionStatus.Active }
          : undefined,
      });
      useSetNextOnboardingStatus()();
      return useRecoilValue(currentUserState)?.onboardingStatus;
    },
    {
      wrapper: RecoilRoot,
    },
  );
  return result;
};

describe('useSetNextOnboardingStatus', () => {
  it('should set next onboarding status for ProfileCreation', () => {
    const result = renderHooks(OnboardingStatus.ProfileCreation, false, false);
    expect(result.current).toEqual(OnboardingStatus.SyncEmail);
  });

  it('should set next onboarding status for SyncEmail', () => {
    const result = renderHooks(OnboardingStatus.SyncEmail, false, false);
    expect(result.current).toEqual(OnboardingStatus.InviteTeam);
  });

  it('should skip invite when workspaceMembers exist', () => {
    const result = renderHooks(OnboardingStatus.SyncEmail, true, true);
    expect(result.current).toEqual(OnboardingStatus.Completed);
  });

  it('should set next onboarding status for Completed', () => {
    const result = renderHooks(OnboardingStatus.InviteTeam, true, false);
    expect(result.current).toEqual(OnboardingStatus.Completed);
  });
});
