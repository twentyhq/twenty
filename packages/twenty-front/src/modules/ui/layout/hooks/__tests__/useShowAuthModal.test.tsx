import { renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { OnboardingStatus } from '@/auth/utils/getOnboardingStatus';
import { AppPath } from '@/types/AppPath';
import { useShowAuthModal } from '@/ui/layout/hooks/useShowAuthModal';
import { isDefaultLayoutAuthModalVisibleState } from '@/ui/layout/states/isDefaultLayoutAuthModalVisibleState';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';

jest.mock('@/auth/hooks/useOnboardingStatus');
const setupMockOnboardingStatus = (onboardingStatus: OnboardingStatus) => {
  jest.mocked(useOnboardingStatus).mockReturnValueOnce(onboardingStatus);
};

jest.mock('~/hooks/useIsMatchingLocation');
const mockUseIsMatchingLocation = jest.mocked(useIsMatchingLocation);

const setupMockIsMatchingLocation = (pathname: string) => {
  mockUseIsMatchingLocation.mockReturnValueOnce(
    (path: string) => path === pathname,
  );
};

const getResult = (isDefaultLayoutAuthModalVisible = true) =>
  renderHook(
    () => {
      const setIsDefaultLayoutAuthModalVisible = useSetRecoilState(
        isDefaultLayoutAuthModalVisibleState,
      );
      setIsDefaultLayoutAuthModalVisible(isDefaultLayoutAuthModalVisible);

      return useShowAuthModal();
    },
    {
      wrapper: RecoilRoot,
    },
  );

// prettier-ignore
const testCases = [
  { loc: AppPath.Verify, status: OnboardingStatus.Incomplete, res: false },
  { loc: AppPath.Verify, status: OnboardingStatus.Canceled, res: false },
  { loc: AppPath.Verify, status: OnboardingStatus.Unpaid, res: false },
  { loc: AppPath.Verify, status: OnboardingStatus.PastDue, res: false },
  { loc: AppPath.Verify, status: OnboardingStatus.OngoingUserCreation, res: false },
  { loc: AppPath.Verify, status: OnboardingStatus.OngoingWorkspaceActivation, res: false },
  { loc: AppPath.Verify, status: OnboardingStatus.OngoingProfileCreation, res: false },
  { loc: AppPath.Verify, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.Verify, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.SignInUp, status: OnboardingStatus.Incomplete, res: true },
  { loc: AppPath.SignInUp, status: OnboardingStatus.Canceled, res: false },
  { loc: AppPath.SignInUp, status: OnboardingStatus.Unpaid, res: false },
  { loc: AppPath.SignInUp, status: OnboardingStatus.PastDue, res: false },
  { loc: AppPath.SignInUp, status: OnboardingStatus.OngoingUserCreation, res: true },
  { loc: AppPath.SignInUp, status: OnboardingStatus.OngoingWorkspaceActivation, res: true },
  { loc: AppPath.SignInUp, status: OnboardingStatus.OngoingProfileCreation, res: true },
  { loc: AppPath.SignInUp, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.SignInUp, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.Invite, status: OnboardingStatus.Incomplete, res: true },
  { loc: AppPath.Invite, status: OnboardingStatus.Canceled, res: true },
  { loc: AppPath.Invite, status: OnboardingStatus.Unpaid, res: true },
  { loc: AppPath.Invite, status: OnboardingStatus.PastDue, res: true },
  { loc: AppPath.Invite, status: OnboardingStatus.OngoingUserCreation, res: true },
  { loc: AppPath.Invite, status: OnboardingStatus.OngoingWorkspaceActivation, res: true },
  { loc: AppPath.Invite, status: OnboardingStatus.OngoingProfileCreation, res: true },
  { loc: AppPath.Invite, status: OnboardingStatus.Completed, res: true },
  { loc: AppPath.Invite, status: OnboardingStatus.CompletedWithoutSubscription, res: true },

  { loc: AppPath.ResetPassword, status: OnboardingStatus.Incomplete, res: true },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.Canceled, res: true },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.Unpaid, res: true },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.PastDue, res: true },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.OngoingUserCreation, res: true },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.OngoingWorkspaceActivation, res: true },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.OngoingProfileCreation, res: true },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.Completed, res: true },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.CompletedWithoutSubscription, res: true },

  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.Incomplete, res: true },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.Canceled, res: false },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.Unpaid, res: false },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.PastDue, res: false },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.OngoingUserCreation, res: true },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.OngoingWorkspaceActivation, res: true },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.OngoingProfileCreation, res: true },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.CreateProfile, status: OnboardingStatus.Incomplete, res: true },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.Canceled, res: false },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.Unpaid, res: false },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.PastDue, res: false },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.OngoingUserCreation, res: true },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.OngoingWorkspaceActivation, res: true },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.OngoingProfileCreation, res: true },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.PlanRequired, status: OnboardingStatus.Incomplete, res: true },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.Canceled, res: true },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.Unpaid, res: false },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.PastDue, res: false },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.OngoingUserCreation, res: true },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.OngoingWorkspaceActivation, res: true },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.OngoingProfileCreation, res: true },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.CompletedWithoutSubscription, res: true },

  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.Incomplete, res: true },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.Canceled, res: false },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.Unpaid, res: false },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.PastDue, res: false },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.OngoingUserCreation, res: true },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.OngoingWorkspaceActivation, res: true },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.OngoingProfileCreation, res: true },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.Index, status: OnboardingStatus.Incomplete, res: true },
  { loc: AppPath.Index, status: OnboardingStatus.Canceled, res: false },
  { loc: AppPath.Index, status: OnboardingStatus.Unpaid, res: false },
  { loc: AppPath.Index, status: OnboardingStatus.PastDue, res: false },
  { loc: AppPath.Index, status: OnboardingStatus.OngoingUserCreation, res: true },
  { loc: AppPath.Index, status: OnboardingStatus.OngoingWorkspaceActivation, res: true },
  { loc: AppPath.Index, status: OnboardingStatus.OngoingProfileCreation, res: true },
  { loc: AppPath.Index, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.Index, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.TasksPage, status: OnboardingStatus.Incomplete, res: true },
  { loc: AppPath.TasksPage, status: OnboardingStatus.Canceled, res: false },
  { loc: AppPath.TasksPage, status: OnboardingStatus.Unpaid, res: false },
  { loc: AppPath.TasksPage, status: OnboardingStatus.PastDue, res: false },
  { loc: AppPath.TasksPage, status: OnboardingStatus.OngoingUserCreation, res: true },
  { loc: AppPath.TasksPage, status: OnboardingStatus.OngoingWorkspaceActivation, res: true },
  { loc: AppPath.TasksPage, status: OnboardingStatus.OngoingProfileCreation, res: true },
  { loc: AppPath.TasksPage, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.TasksPage, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.Incomplete, res: true },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.Canceled, res: false },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.Unpaid, res: false },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.PastDue, res: false },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.OngoingUserCreation, res: true },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.OngoingWorkspaceActivation, res: true },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.OngoingProfileCreation, res: true },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.Incomplete, res: true },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.Canceled, res: false },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.Unpaid, res: false },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.PastDue, res: false },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.OngoingUserCreation, res: true },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.OngoingWorkspaceActivation, res: true },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.OngoingProfileCreation, res: true },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.RecordShowPage, status: OnboardingStatus.Incomplete, res: true },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.Canceled, res: false },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.Unpaid, res: false },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.PastDue, res: false },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.OngoingUserCreation, res: true },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.OngoingWorkspaceActivation, res: true },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.OngoingProfileCreation, res: true },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.Incomplete, res: true },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.Canceled, res: false },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.Unpaid, res: false },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.PastDue, res: false },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.OngoingUserCreation, res: true },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.OngoingWorkspaceActivation, res: true },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.OngoingProfileCreation, res: true },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.Incomplete, res: true },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.Canceled, res: false },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.Unpaid, res: false },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.PastDue, res: false },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.OngoingUserCreation, res: true },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.OngoingWorkspaceActivation, res: true },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.OngoingProfileCreation, res: true },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.Impersonate, status: OnboardingStatus.Incomplete, res: true },
  { loc: AppPath.Impersonate, status: OnboardingStatus.Canceled, res: false },
  { loc: AppPath.Impersonate, status: OnboardingStatus.Unpaid, res: false },
  { loc: AppPath.Impersonate, status: OnboardingStatus.PastDue, res: false },
  { loc: AppPath.Impersonate, status: OnboardingStatus.OngoingUserCreation, res: true },
  { loc: AppPath.Impersonate, status: OnboardingStatus.OngoingWorkspaceActivation, res: true },
  { loc: AppPath.Impersonate, status: OnboardingStatus.OngoingProfileCreation, res: true },
  { loc: AppPath.Impersonate, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.Impersonate, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.Authorize, status: OnboardingStatus.Incomplete, res: true },
  { loc: AppPath.Authorize, status: OnboardingStatus.Canceled, res: false },
  { loc: AppPath.Authorize, status: OnboardingStatus.Unpaid, res: false },
  { loc: AppPath.Authorize, status: OnboardingStatus.PastDue, res: false },
  { loc: AppPath.Authorize, status: OnboardingStatus.OngoingUserCreation, res: true },
  { loc: AppPath.Authorize, status: OnboardingStatus.OngoingWorkspaceActivation, res: true },
  { loc: AppPath.Authorize, status: OnboardingStatus.OngoingProfileCreation, res: true },
  { loc: AppPath.Authorize, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.Authorize, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.Incomplete, res: true },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.Canceled, res: false },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.Unpaid, res: false },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.PastDue, res: false },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.OngoingUserCreation, res: true },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.OngoingWorkspaceActivation, res: true },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.OngoingProfileCreation, res: true },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.NotFound, status: OnboardingStatus.Incomplete, res: true },
  { loc: AppPath.NotFound, status: OnboardingStatus.Canceled, res: false },
  { loc: AppPath.NotFound, status: OnboardingStatus.Unpaid, res: false },
  { loc: AppPath.NotFound, status: OnboardingStatus.PastDue, res: false },
  { loc: AppPath.NotFound, status: OnboardingStatus.OngoingUserCreation, res: true },
  { loc: AppPath.NotFound, status: OnboardingStatus.OngoingWorkspaceActivation, res: true },
  { loc: AppPath.NotFound, status: OnboardingStatus.OngoingProfileCreation, res: true },
  { loc: AppPath.NotFound, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.NotFound, status: OnboardingStatus.CompletedWithoutSubscription, res: false },
];

describe('useShowAuthModal', () => {
  testCases.forEach((testCase) => {
    it(`testCase for location ${testCase.loc} with onboardingStatus ${testCase.status} should return ${testCase.res}`, () => {
      setupMockOnboardingStatus(testCase.status);
      setupMockIsMatchingLocation(testCase.loc);
      const { result } = getResult();
      if (testCase.res) {
        expect(result.current).toBeTruthy();
      } else {
        expect(result.current).toBeFalsy();
      }
    });
  });

  describe('test with token validation loading', () => {
    it(`with appPath ${AppPath.Invite} and isDefaultLayoutAuthModalVisible=false`, () => {
      setupMockOnboardingStatus(OnboardingStatus.Completed);
      setupMockIsMatchingLocation(AppPath.Invite);
      const { result } = getResult(false);
      expect(result.current).toBeFalsy();
    });
    it(`with appPath ${AppPath.ResetPassword} and isDefaultLayoutAuthModalVisible=false`, () => {
      setupMockOnboardingStatus(OnboardingStatus.Completed);
      setupMockIsMatchingLocation(AppPath.ResetPassword);
      const { result } = getResult(false);
      expect(result.current).toBeFalsy();
    });
  });

  describe('tests should be exhaustive', () => {
    it('all location and onboarding status should be tested', () => {
      expect(testCases.length).toEqual(
        Object.keys(AppPath).length * Object.keys(OnboardingStatus).length,
      );
    });
  });
});
