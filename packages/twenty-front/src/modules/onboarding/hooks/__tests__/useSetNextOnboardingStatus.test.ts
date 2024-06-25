import { renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue, useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { OnboardingStatus } from '~/generated/graphql';
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
) => {
  const { result } = renderHook(
    () => {
      const useFindManyRecordsMock = jest.requireMock(
        '@/object-record/hooks/useFindManyRecords',
      );
      useFindManyRecordsMock.useFindManyRecords.mockReturnValue({
        records: [],
      });
      const setCurrentUser = useSetRecoilState(currentUserState);
      const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
      setCurrentUser({ ...mockedUserData, onboardingStatus });
      setCurrentWorkspace({
        ...mockDefaultWorkspace,
        currentBillingSubscription: withCurrentBillingSubscription
          ? { id: v4(), status: 'status' }
          : undefined,
      });
      const setNextOnboardingStatus = useSetNextOnboardingStatus();
      setNextOnboardingStatus(onboardingStatus);
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
    const result = renderHooks(OnboardingStatus.ProfileCreation, false);
    expect(result.current).toEqual(OnboardingStatus.SyncEmail);
  });

  it('should set next onboarding status for SyncEmail', () => {
    const result = renderHooks(OnboardingStatus.SyncEmail, false);
    expect(result.current).toEqual(OnboardingStatus.InviteTeam);
  });

  it('should set next onboarding status for Completed', () => {
    const result = renderHooks(OnboardingStatus.InviteTeam, true);
    expect(result.current).toEqual(OnboardingStatus.Completed);
  });

  it('should set next onboarding status for Completed without subscription', () => {
    const result = renderHooks(OnboardingStatus.InviteTeam, false);
    expect(result.current).toEqual(
      OnboardingStatus.CompletedWithoutSubscription,
    );
  });
});
