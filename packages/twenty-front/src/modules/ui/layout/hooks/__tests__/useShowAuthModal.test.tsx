import { renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { AppPath } from '@/types/AppPath';
import { useShowAuthModal } from '@/ui/layout/hooks/useShowAuthModal';
import { isDefaultLayoutAuthModalVisibleState } from '@/ui/layout/states/isDefaultLayoutAuthModalVisibleState';
import { OnboardingStatus } from '~/generated/graphql';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';

jest.mock('@/auth/hooks/useOnboardingStatus');
const setupMockOnboardingStatus = (
  onboardingStatus: OnboardingStatus | undefined,
) => {
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
  { loc: AppPath.Verify, status: OnboardingStatus.PlanRequired, res: false },
  { loc: AppPath.Verify, status: OnboardingStatus.SubscriptionCanceled, res: false },
  { loc: AppPath.Verify, status: OnboardingStatus.SubscriptionUnpaid, res: false },
  { loc: AppPath.Verify, status: OnboardingStatus.SubscriptionPastDue, res: false },
  { loc: AppPath.Verify, status: undefined, res: false },
  { loc: AppPath.Verify, status: OnboardingStatus.WorkspaceActivation, res: false },
  { loc: AppPath.Verify, status: OnboardingStatus.ProfileCreation, res: false },
  { loc: AppPath.Verify, status: OnboardingStatus.SyncEmail, res: false },
  { loc: AppPath.Verify, status: OnboardingStatus.InviteTeam, res: false },
  { loc: AppPath.Verify, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.Verify, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.SignInUp, status: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.SignInUp, status: OnboardingStatus.SubscriptionCanceled, res: false },
  { loc: AppPath.SignInUp, status: OnboardingStatus.SubscriptionUnpaid, res: false },
  { loc: AppPath.SignInUp, status: OnboardingStatus.SubscriptionPastDue, res: false },
  { loc: AppPath.SignInUp, status: undefined, res: true },
  { loc: AppPath.SignInUp, status: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.SignInUp, status: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.SignInUp, status: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.SignInUp, status: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.SignInUp, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.SignInUp, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.Invite, status: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.Invite, status: OnboardingStatus.SubscriptionCanceled, res: true },
  { loc: AppPath.Invite, status: OnboardingStatus.SubscriptionUnpaid, res: true },
  { loc: AppPath.Invite, status: OnboardingStatus.SubscriptionPastDue, res: true },
  { loc: AppPath.Invite, status: undefined, res: true },
  { loc: AppPath.Invite, status: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.Invite, status: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.Invite, status: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.Invite, status: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.Invite, status: OnboardingStatus.Completed, res: true },
  { loc: AppPath.Invite, status: OnboardingStatus.CompletedWithoutSubscription, res: true },

  { loc: AppPath.ResetPassword, status: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.SubscriptionCanceled, res: true },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.SubscriptionUnpaid, res: true },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.SubscriptionPastDue, res: true },
  { loc: AppPath.ResetPassword, status: undefined, res: true },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.Completed, res: true },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.CompletedWithoutSubscription, res: true },

  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.SubscriptionCanceled, res: false },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.SubscriptionUnpaid, res: false },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.SubscriptionPastDue, res: false },
  { loc: AppPath.CreateWorkspace, status: undefined, res: true },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.CreateProfile, status: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.SubscriptionCanceled, res: false },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.SubscriptionUnpaid, res: false },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.SubscriptionPastDue, res: false },
  { loc: AppPath.CreateProfile, status: undefined, res: true },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.SyncEmails, status: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.SyncEmails, status: OnboardingStatus.SubscriptionCanceled, res: false },
  { loc: AppPath.SyncEmails, status: OnboardingStatus.SubscriptionUnpaid, res: false },
  { loc: AppPath.SyncEmails, status: OnboardingStatus.SubscriptionPastDue, res: false },
  { loc: AppPath.SyncEmails, status: undefined, res: true },
  { loc: AppPath.SyncEmails, status: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.SyncEmails, status: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.SyncEmails, status: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.SyncEmails, status: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.SyncEmails, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.SyncEmails, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.InviteTeam, status: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.InviteTeam, status: OnboardingStatus.SubscriptionCanceled, res: false },
  { loc: AppPath.InviteTeam, status: OnboardingStatus.SubscriptionUnpaid, res: false },
  { loc: AppPath.InviteTeam, status: OnboardingStatus.SubscriptionPastDue, res: false },
  { loc: AppPath.InviteTeam, status: undefined, res: true },
  { loc: AppPath.InviteTeam, status: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.InviteTeam, status: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.InviteTeam, status: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.InviteTeam, status: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.InviteTeam, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.InviteTeam, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.PlanRequired, status: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.SubscriptionCanceled, res: true },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.SubscriptionUnpaid, res: false },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.SubscriptionPastDue, res: false },
  { loc: AppPath.PlanRequired, status: undefined, res: true },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.CompletedWithoutSubscription, res: true },

  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.SubscriptionCanceled, res: false },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.SubscriptionUnpaid, res: false },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.SubscriptionPastDue, res: false },
  { loc: AppPath.PlanRequiredSuccess, status: undefined, res: true },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.Index, status: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.Index, status: OnboardingStatus.SubscriptionCanceled, res: false },
  { loc: AppPath.Index, status: OnboardingStatus.SubscriptionUnpaid, res: false },
  { loc: AppPath.Index, status: OnboardingStatus.SubscriptionPastDue, res: false },
  { loc: AppPath.Index, status: undefined, res: true },
  { loc: AppPath.Index, status: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.Index, status: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.Index, status: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.Index, status: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.Index, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.Index, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.TasksPage, status: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.TasksPage, status: OnboardingStatus.SubscriptionCanceled, res: false },
  { loc: AppPath.TasksPage, status: OnboardingStatus.SubscriptionUnpaid, res: false },
  { loc: AppPath.TasksPage, status: OnboardingStatus.SubscriptionPastDue, res: false },
  { loc: AppPath.TasksPage, status: undefined, res: true },
  { loc: AppPath.TasksPage, status: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.TasksPage, status: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.TasksPage, status: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.TasksPage, status: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.TasksPage, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.TasksPage, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.SubscriptionCanceled, res: false },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.SubscriptionUnpaid, res: false },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.SubscriptionPastDue, res: false },
  { loc: AppPath.OpportunitiesPage, status: undefined, res: true },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.SubscriptionCanceled, res: false },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.SubscriptionUnpaid, res: false },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.SubscriptionPastDue, res: false },
  { loc: AppPath.RecordIndexPage, status: undefined, res: true },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.RecordShowPage, status: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.SubscriptionCanceled, res: false },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.SubscriptionUnpaid, res: false },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.SubscriptionPastDue, res: false },
  { loc: AppPath.RecordShowPage, status: undefined, res: true },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.SubscriptionCanceled, res: false },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.SubscriptionUnpaid, res: false },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.SubscriptionPastDue, res: false },
  { loc: AppPath.SettingsCatchAll, status: undefined, res: true },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.SubscriptionCanceled, res: false },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.SubscriptionUnpaid, res: false },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.SubscriptionPastDue, res: false },
  { loc: AppPath.DevelopersCatchAll, status: undefined, res: true },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.Impersonate, status: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.Impersonate, status: OnboardingStatus.SubscriptionCanceled, res: false },
  { loc: AppPath.Impersonate, status: OnboardingStatus.SubscriptionUnpaid, res: false },
  { loc: AppPath.Impersonate, status: OnboardingStatus.SubscriptionPastDue, res: false },
  { loc: AppPath.Impersonate, status: undefined, res: true },
  { loc: AppPath.Impersonate, status: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.Impersonate, status: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.Impersonate, status: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.Impersonate, status: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.Impersonate, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.Impersonate, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.Authorize, status: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.Authorize, status: OnboardingStatus.SubscriptionCanceled, res: false },
  { loc: AppPath.Authorize, status: OnboardingStatus.SubscriptionUnpaid, res: false },
  { loc: AppPath.Authorize, status: OnboardingStatus.SubscriptionPastDue, res: false },
  { loc: AppPath.Authorize, status: undefined, res: true },
  { loc: AppPath.Authorize, status: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.Authorize, status: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.Authorize, status: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.Authorize, status: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.Authorize, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.Authorize, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.SubscriptionCanceled, res: false },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.SubscriptionUnpaid, res: false },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.SubscriptionPastDue, res: false },
  { loc: AppPath.NotFoundWildcard, status: undefined, res: true },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.Completed, res: false },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.CompletedWithoutSubscription, res: false },

  { loc: AppPath.NotFound, status: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.NotFound, status: OnboardingStatus.SubscriptionCanceled, res: false },
  { loc: AppPath.NotFound, status: OnboardingStatus.SubscriptionUnpaid, res: false },
  { loc: AppPath.NotFound, status: OnboardingStatus.SubscriptionPastDue, res: false },
  { loc: AppPath.NotFound, status: undefined, res: true },
  { loc: AppPath.NotFound, status: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.NotFound, status: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.NotFound, status: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.NotFound, status: OnboardingStatus.InviteTeam, res: true },
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
        Object.keys(AppPath).length *
          (Object.keys(OnboardingStatus).length + 1),
      );
    });
  });
});
