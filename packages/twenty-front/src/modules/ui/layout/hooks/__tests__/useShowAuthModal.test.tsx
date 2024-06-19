import { renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { OnboardingStatus } from '@/auth/utils/getOnboardingStatus';
import { AppPath } from '@/types/AppPath';
import { useShowAuthModal } from '@/ui/layout/hooks/useShowAuthModal';
import { isDefaultLayoutAuthModalVisibleState } from '@/ui/layout/states/isDefaultLayoutAuthModalVisibleState';
import { OnboardingStep } from '~/generated/graphql';
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
  { loc: AppPath.Verify, status: OnboardingStep.SubscriptionIncomplete, res: false },
  { loc: AppPath.Verify, status: OnboardingStep.SubscriptionCanceled, res: false },
  { loc: AppPath.Verify, status: OnboardingStep.SubscriptionUnpaid, res: false },
  { loc: AppPath.Verify, status: OnboardingStep.SubscriptionPastDue, res: false },
  { loc: AppPath.Verify, status: OnboardingStep.UserCreation, res: false },
  { loc: AppPath.Verify, status: OnboardingStep.WorkspaceActivation, res: false },
  { loc: AppPath.Verify, status: OnboardingStep.ProfileCreation, res: false },
  { loc: AppPath.Verify, status: OnboardingStep.SyncEmail, res: false },
  { loc: AppPath.Verify, status: OnboardingStep.InviteTeam, res: false },
  { loc: AppPath.Verify, status: OnboardingStep.Completed, res: false },
  { loc: AppPath.Verify, status: OnboardingStep.CompletedWithoutSubscription, res: false },

  { loc: AppPath.SignInUp, status: OnboardingStep.SubscriptionIncomplete, res: true },
  { loc: AppPath.SignInUp, status: OnboardingStep.SubscriptionCanceled, res: false },
  { loc: AppPath.SignInUp, status: OnboardingStep.SubscriptionUnpaid, res: false },
  { loc: AppPath.SignInUp, status: OnboardingStep.SubscriptionPastDue, res: false },
  { loc: AppPath.SignInUp, status: OnboardingStep.UserCreation, res: true },
  { loc: AppPath.SignInUp, status: OnboardingStep.WorkspaceActivation, res: true },
  { loc: AppPath.SignInUp, status: OnboardingStep.ProfileCreation, res: true },
  { loc: AppPath.SignInUp, status: OnboardingStep.SyncEmail, res: true },
  { loc: AppPath.SignInUp, status: OnboardingStep.InviteTeam, res: true },
  { loc: AppPath.SignInUp, status: OnboardingStep.Completed, res: false },
  { loc: AppPath.SignInUp, status: OnboardingStep.CompletedWithoutSubscription, res: false },

  { loc: AppPath.Invite, status: OnboardingStep.SubscriptionIncomplete, res: true },
  { loc: AppPath.Invite, status: OnboardingStep.SubscriptionCanceled, res: true },
  { loc: AppPath.Invite, status: OnboardingStep.SubscriptionUnpaid, res: true },
  { loc: AppPath.Invite, status: OnboardingStep.SubscriptionPastDue, res: true },
  { loc: AppPath.Invite, status: OnboardingStep.UserCreation, res: true },
  { loc: AppPath.Invite, status: OnboardingStep.WorkspaceActivation, res: true },
  { loc: AppPath.Invite, status: OnboardingStep.ProfileCreation, res: true },
  { loc: AppPath.Invite, status: OnboardingStep.SyncEmail, res: true },
  { loc: AppPath.Invite, status: OnboardingStep.InviteTeam, res: true },
  { loc: AppPath.Invite, status: OnboardingStep.Completed, res: true },
  { loc: AppPath.Invite, status: OnboardingStep.CompletedWithoutSubscription, res: true },

  { loc: AppPath.ResetPassword, status: OnboardingStep.SubscriptionIncomplete, res: true },
  { loc: AppPath.ResetPassword, status: OnboardingStep.SubscriptionCanceled, res: true },
  { loc: AppPath.ResetPassword, status: OnboardingStep.SubscriptionUnpaid, res: true },
  { loc: AppPath.ResetPassword, status: OnboardingStep.SubscriptionPastDue, res: true },
  { loc: AppPath.ResetPassword, status: OnboardingStep.UserCreation, res: true },
  { loc: AppPath.ResetPassword, status: OnboardingStep.WorkspaceActivation, res: true },
  { loc: AppPath.ResetPassword, status: OnboardingStep.ProfileCreation, res: true },
  { loc: AppPath.ResetPassword, status: OnboardingStep.SyncEmail, res: true },
  { loc: AppPath.ResetPassword, status: OnboardingStep.InviteTeam, res: true },
  { loc: AppPath.ResetPassword, status: OnboardingStep.Completed, res: true },
  { loc: AppPath.ResetPassword, status: OnboardingStep.CompletedWithoutSubscription, res: true },

  { loc: AppPath.CreateWorkspace, status: OnboardingStep.SubscriptionIncomplete, res: true },
  { loc: AppPath.CreateWorkspace, status: OnboardingStep.SubscriptionCanceled, res: false },
  { loc: AppPath.CreateWorkspace, status: OnboardingStep.SubscriptionUnpaid, res: false },
  { loc: AppPath.CreateWorkspace, status: OnboardingStep.SubscriptionPastDue, res: false },
  { loc: AppPath.CreateWorkspace, status: OnboardingStep.UserCreation, res: true },
  { loc: AppPath.CreateWorkspace, status: OnboardingStep.WorkspaceActivation, res: true },
  { loc: AppPath.CreateWorkspace, status: OnboardingStep.ProfileCreation, res: true },
  { loc: AppPath.CreateWorkspace, status: OnboardingStep.SyncEmail, res: true },
  { loc: AppPath.CreateWorkspace, status: OnboardingStep.InviteTeam, res: true },
  { loc: AppPath.CreateWorkspace, status: OnboardingStep.Completed, res: false },
  { loc: AppPath.CreateWorkspace, status: OnboardingStep.CompletedWithoutSubscription, res: false },

  { loc: AppPath.CreateProfile, status: OnboardingStep.SubscriptionIncomplete, res: true },
  { loc: AppPath.CreateProfile, status: OnboardingStep.SubscriptionCanceled, res: false },
  { loc: AppPath.CreateProfile, status: OnboardingStep.SubscriptionUnpaid, res: false },
  { loc: AppPath.CreateProfile, status: OnboardingStep.SubscriptionPastDue, res: false },
  { loc: AppPath.CreateProfile, status: OnboardingStep.UserCreation, res: true },
  { loc: AppPath.CreateProfile, status: OnboardingStep.WorkspaceActivation, res: true },
  { loc: AppPath.CreateProfile, status: OnboardingStep.ProfileCreation, res: true },
  { loc: AppPath.CreateProfile, status: OnboardingStep.SyncEmail, res: true },
  { loc: AppPath.CreateProfile, status: OnboardingStep.InviteTeam, res: true },
  { loc: AppPath.CreateProfile, status: OnboardingStep.Completed, res: false },
  { loc: AppPath.CreateProfile, status: OnboardingStep.CompletedWithoutSubscription, res: false },

  { loc: AppPath.SyncEmails, status: OnboardingStep.SubscriptionIncomplete, res: true },
  { loc: AppPath.SyncEmails, status: OnboardingStep.SubscriptionCanceled, res: false },
  { loc: AppPath.SyncEmails, status: OnboardingStep.SubscriptionUnpaid, res: false },
  { loc: AppPath.SyncEmails, status: OnboardingStep.SubscriptionPastDue, res: false },
  { loc: AppPath.SyncEmails, status: OnboardingStep.UserCreation, res: true },
  { loc: AppPath.SyncEmails, status: OnboardingStep.WorkspaceActivation, res: true },
  { loc: AppPath.SyncEmails, status: OnboardingStep.ProfileCreation, res: true },
  { loc: AppPath.SyncEmails, status: OnboardingStep.SyncEmail, res: true },
  { loc: AppPath.SyncEmails, status: OnboardingStep.InviteTeam, res: true },
  { loc: AppPath.SyncEmails, status: OnboardingStep.Completed, res: false },
  { loc: AppPath.SyncEmails, status: OnboardingStep.CompletedWithoutSubscription, res: false },

  { loc: AppPath.InviteTeam, status: OnboardingStep.SubscriptionIncomplete, res: true },
  { loc: AppPath.InviteTeam, status: OnboardingStep.SubscriptionCanceled, res: false },
  { loc: AppPath.InviteTeam, status: OnboardingStep.SubscriptionUnpaid, res: false },
  { loc: AppPath.InviteTeam, status: OnboardingStep.SubscriptionPastDue, res: false },
  { loc: AppPath.InviteTeam, status: OnboardingStep.UserCreation, res: true },
  { loc: AppPath.InviteTeam, status: OnboardingStep.WorkspaceActivation, res: true },
  { loc: AppPath.InviteTeam, status: OnboardingStep.ProfileCreation, res: true },
  { loc: AppPath.InviteTeam, status: OnboardingStep.SyncEmail, res: true },
  { loc: AppPath.InviteTeam, status: OnboardingStep.InviteTeam, res: true },
  { loc: AppPath.InviteTeam, status: OnboardingStep.Completed, res: false },
  { loc: AppPath.InviteTeam, status: OnboardingStep.CompletedWithoutSubscription, res: false },

  { loc: AppPath.PlanRequired, status: OnboardingStep.SubscriptionIncomplete, res: true },
  { loc: AppPath.PlanRequired, status: OnboardingStep.SubscriptionCanceled, res: true },
  { loc: AppPath.PlanRequired, status: OnboardingStep.SubscriptionUnpaid, res: false },
  { loc: AppPath.PlanRequired, status: OnboardingStep.SubscriptionPastDue, res: false },
  { loc: AppPath.PlanRequired, status: OnboardingStep.UserCreation, res: true },
  { loc: AppPath.PlanRequired, status: OnboardingStep.WorkspaceActivation, res: true },
  { loc: AppPath.PlanRequired, status: OnboardingStep.ProfileCreation, res: true },
  { loc: AppPath.PlanRequired, status: OnboardingStep.SyncEmail, res: true },
  { loc: AppPath.PlanRequired, status: OnboardingStep.InviteTeam, res: true },
  { loc: AppPath.PlanRequired, status: OnboardingStep.Completed, res: false },
  { loc: AppPath.PlanRequired, status: OnboardingStep.CompletedWithoutSubscription, res: true },

  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStep.SubscriptionIncomplete, res: true },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStep.SubscriptionCanceled, res: false },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStep.SubscriptionUnpaid, res: false },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStep.SubscriptionPastDue, res: false },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStep.UserCreation, res: true },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStep.WorkspaceActivation, res: true },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStep.ProfileCreation, res: true },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStep.SyncEmail, res: true },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStep.InviteTeam, res: true },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStep.Completed, res: false },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStep.CompletedWithoutSubscription, res: false },

  { loc: AppPath.Index, status: OnboardingStep.SubscriptionIncomplete, res: true },
  { loc: AppPath.Index, status: OnboardingStep.SubscriptionCanceled, res: false },
  { loc: AppPath.Index, status: OnboardingStep.SubscriptionUnpaid, res: false },
  { loc: AppPath.Index, status: OnboardingStep.SubscriptionPastDue, res: false },
  { loc: AppPath.Index, status: OnboardingStep.UserCreation, res: true },
  { loc: AppPath.Index, status: OnboardingStep.WorkspaceActivation, res: true },
  { loc: AppPath.Index, status: OnboardingStep.ProfileCreation, res: true },
  { loc: AppPath.Index, status: OnboardingStep.SyncEmail, res: true },
  { loc: AppPath.Index, status: OnboardingStep.InviteTeam, res: true },
  { loc: AppPath.Index, status: OnboardingStep.Completed, res: false },
  { loc: AppPath.Index, status: OnboardingStep.CompletedWithoutSubscription, res: false },

  { loc: AppPath.TasksPage, status: OnboardingStep.SubscriptionIncomplete, res: true },
  { loc: AppPath.TasksPage, status: OnboardingStep.SubscriptionCanceled, res: false },
  { loc: AppPath.TasksPage, status: OnboardingStep.SubscriptionUnpaid, res: false },
  { loc: AppPath.TasksPage, status: OnboardingStep.SubscriptionPastDue, res: false },
  { loc: AppPath.TasksPage, status: OnboardingStep.UserCreation, res: true },
  { loc: AppPath.TasksPage, status: OnboardingStep.WorkspaceActivation, res: true },
  { loc: AppPath.TasksPage, status: OnboardingStep.ProfileCreation, res: true },
  { loc: AppPath.TasksPage, status: OnboardingStep.SyncEmail, res: true },
  { loc: AppPath.TasksPage, status: OnboardingStep.InviteTeam, res: true },
  { loc: AppPath.TasksPage, status: OnboardingStep.Completed, res: false },
  { loc: AppPath.TasksPage, status: OnboardingStep.CompletedWithoutSubscription, res: false },

  { loc: AppPath.OpportunitiesPage, status: OnboardingStep.SubscriptionIncomplete, res: true },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStep.SubscriptionCanceled, res: false },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStep.SubscriptionUnpaid, res: false },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStep.SubscriptionPastDue, res: false },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStep.UserCreation, res: true },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStep.WorkspaceActivation, res: true },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStep.ProfileCreation, res: true },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStep.SyncEmail, res: true },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStep.InviteTeam, res: true },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStep.Completed, res: false },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStep.CompletedWithoutSubscription, res: false },

  { loc: AppPath.RecordIndexPage, status: OnboardingStep.SubscriptionIncomplete, res: true },
  { loc: AppPath.RecordIndexPage, status: OnboardingStep.SubscriptionCanceled, res: false },
  { loc: AppPath.RecordIndexPage, status: OnboardingStep.SubscriptionUnpaid, res: false },
  { loc: AppPath.RecordIndexPage, status: OnboardingStep.SubscriptionPastDue, res: false },
  { loc: AppPath.RecordIndexPage, status: OnboardingStep.UserCreation, res: true },
  { loc: AppPath.RecordIndexPage, status: OnboardingStep.WorkspaceActivation, res: true },
  { loc: AppPath.RecordIndexPage, status: OnboardingStep.ProfileCreation, res: true },
  { loc: AppPath.RecordIndexPage, status: OnboardingStep.SyncEmail, res: true },
  { loc: AppPath.RecordIndexPage, status: OnboardingStep.InviteTeam, res: true },
  { loc: AppPath.RecordIndexPage, status: OnboardingStep.Completed, res: false },
  { loc: AppPath.RecordIndexPage, status: OnboardingStep.CompletedWithoutSubscription, res: false },

  { loc: AppPath.RecordShowPage, status: OnboardingStep.SubscriptionIncomplete, res: true },
  { loc: AppPath.RecordShowPage, status: OnboardingStep.SubscriptionCanceled, res: false },
  { loc: AppPath.RecordShowPage, status: OnboardingStep.SubscriptionUnpaid, res: false },
  { loc: AppPath.RecordShowPage, status: OnboardingStep.SubscriptionPastDue, res: false },
  { loc: AppPath.RecordShowPage, status: OnboardingStep.UserCreation, res: true },
  { loc: AppPath.RecordShowPage, status: OnboardingStep.WorkspaceActivation, res: true },
  { loc: AppPath.RecordShowPage, status: OnboardingStep.ProfileCreation, res: true },
  { loc: AppPath.RecordShowPage, status: OnboardingStep.SyncEmail, res: true },
  { loc: AppPath.RecordShowPage, status: OnboardingStep.InviteTeam, res: true },
  { loc: AppPath.RecordShowPage, status: OnboardingStep.Completed, res: false },
  { loc: AppPath.RecordShowPage, status: OnboardingStep.CompletedWithoutSubscription, res: false },

  { loc: AppPath.SettingsCatchAll, status: OnboardingStep.SubscriptionIncomplete, res: true },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStep.SubscriptionCanceled, res: false },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStep.SubscriptionUnpaid, res: false },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStep.SubscriptionPastDue, res: false },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStep.UserCreation, res: true },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStep.WorkspaceActivation, res: true },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStep.ProfileCreation, res: true },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStep.SyncEmail, res: true },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStep.InviteTeam, res: true },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStep.Completed, res: false },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStep.CompletedWithoutSubscription, res: false },

  { loc: AppPath.DevelopersCatchAll, status: OnboardingStep.SubscriptionIncomplete, res: true },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStep.SubscriptionCanceled, res: false },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStep.SubscriptionUnpaid, res: false },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStep.SubscriptionPastDue, res: false },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStep.UserCreation, res: true },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStep.WorkspaceActivation, res: true },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStep.ProfileCreation, res: true },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStep.SyncEmail, res: true },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStep.InviteTeam, res: true },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStep.Completed, res: false },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStep.CompletedWithoutSubscription, res: false },

  { loc: AppPath.Impersonate, status: OnboardingStep.SubscriptionIncomplete, res: true },
  { loc: AppPath.Impersonate, status: OnboardingStep.SubscriptionCanceled, res: false },
  { loc: AppPath.Impersonate, status: OnboardingStep.SubscriptionUnpaid, res: false },
  { loc: AppPath.Impersonate, status: OnboardingStep.SubscriptionPastDue, res: false },
  { loc: AppPath.Impersonate, status: OnboardingStep.UserCreation, res: true },
  { loc: AppPath.Impersonate, status: OnboardingStep.WorkspaceActivation, res: true },
  { loc: AppPath.Impersonate, status: OnboardingStep.ProfileCreation, res: true },
  { loc: AppPath.Impersonate, status: OnboardingStep.SyncEmail, res: true },
  { loc: AppPath.Impersonate, status: OnboardingStep.InviteTeam, res: true },
  { loc: AppPath.Impersonate, status: OnboardingStep.Completed, res: false },
  { loc: AppPath.Impersonate, status: OnboardingStep.CompletedWithoutSubscription, res: false },

  { loc: AppPath.Authorize, status: OnboardingStep.SubscriptionIncomplete, res: true },
  { loc: AppPath.Authorize, status: OnboardingStep.SubscriptionCanceled, res: false },
  { loc: AppPath.Authorize, status: OnboardingStep.SubscriptionUnpaid, res: false },
  { loc: AppPath.Authorize, status: OnboardingStep.SubscriptionPastDue, res: false },
  { loc: AppPath.Authorize, status: OnboardingStep.UserCreation, res: true },
  { loc: AppPath.Authorize, status: OnboardingStep.WorkspaceActivation, res: true },
  { loc: AppPath.Authorize, status: OnboardingStep.ProfileCreation, res: true },
  { loc: AppPath.Authorize, status: OnboardingStep.SyncEmail, res: true },
  { loc: AppPath.Authorize, status: OnboardingStep.InviteTeam, res: true },
  { loc: AppPath.Authorize, status: OnboardingStep.Completed, res: false },
  { loc: AppPath.Authorize, status: OnboardingStep.CompletedWithoutSubscription, res: false },

  { loc: AppPath.NotFoundWildcard, status: OnboardingStep.SubscriptionIncomplete, res: true },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStep.SubscriptionCanceled, res: false },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStep.SubscriptionUnpaid, res: false },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStep.SubscriptionPastDue, res: false },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStep.UserCreation, res: true },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStep.WorkspaceActivation, res: true },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStep.ProfileCreation, res: true },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStep.SyncEmail, res: true },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStep.InviteTeam, res: true },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStep.Completed, res: false },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStep.CompletedWithoutSubscription, res: false },

  { loc: AppPath.NotFound, status: OnboardingStep.SubscriptionIncomplete, res: true },
  { loc: AppPath.NotFound, status: OnboardingStep.SubscriptionCanceled, res: false },
  { loc: AppPath.NotFound, status: OnboardingStep.SubscriptionUnpaid, res: false },
  { loc: AppPath.NotFound, status: OnboardingStep.SubscriptionPastDue, res: false },
  { loc: AppPath.NotFound, status: OnboardingStep.UserCreation, res: true },
  { loc: AppPath.NotFound, status: OnboardingStep.WorkspaceActivation, res: true },
  { loc: AppPath.NotFound, status: OnboardingStep.ProfileCreation, res: true },
  { loc: AppPath.NotFound, status: OnboardingStep.SyncEmail, res: true },
  { loc: AppPath.NotFound, status: OnboardingStep.InviteTeam, res: true },
  { loc: AppPath.NotFound, status: OnboardingStep.Completed, res: false },
  { loc: AppPath.NotFound, status: OnboardingStep.CompletedWithoutSubscription, res: false },
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
      setupMockOnboardingStatus(OnboardingStep.Completed);
      setupMockIsMatchingLocation(AppPath.Invite);
      const { result } = getResult(false);
      expect(result.current).toBeFalsy();
    });
    it(`with appPath ${AppPath.ResetPassword} and isDefaultLayoutAuthModalVisible=false`, () => {
      setupMockOnboardingStatus(OnboardingStep.Completed);
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
