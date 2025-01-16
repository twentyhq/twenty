import { renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { AppPath } from '@/types/AppPath';
import { useShowAuthModal } from '@/ui/layout/hooks/useShowAuthModal';
import { isDefaultLayoutAuthModalVisibleState } from '@/ui/layout/states/isDefaultLayoutAuthModalVisibleState';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { OnboardingStatus, SubscriptionStatus } from '~/generated/graphql';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';
import { UNTESTED_APP_PATHS } from '~/testing/constants/UntestedAppPaths';

jest.mock('@/onboarding/hooks/useOnboardingStatus');
const setupMockOnboardingStatus = (
  onboardingStatus: OnboardingStatus | undefined,
) => {
  jest.mocked(useOnboardingStatus).mockReturnValueOnce(onboardingStatus);
};

jest.mock('@/workspace/hooks/useSubscriptionStatus');
const setupMockSubscriptionStatus = (
  subscriptionStatus: SubscriptionStatus | undefined,
) => {
  jest.mocked(useSubscriptionStatus).mockReturnValueOnce(subscriptionStatus);
};

jest.mock('@/auth/hooks/useIsLogged');
const setupMockIsLogged = (isLogged: boolean) => {
  jest.mocked(useIsLogged).mockReturnValueOnce(isLogged);
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
  { loc: AppPath.Verify, isLogged: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: false },
  { loc: AppPath.Verify, isLogged: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.Verify, isLogged: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.Verify, isLogged: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.Verify, isLogged: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: false },
  { loc: AppPath.Verify, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: false },
  { loc: AppPath.Verify, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: false },
  { loc: AppPath.Verify, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: false },
  { loc: AppPath.Verify, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: false },
  { loc: AppPath.Verify, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.VerifyEmail, isLogged: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.VerifyEmail, isLogged: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: true },
  { loc: AppPath.VerifyEmail, isLogged: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: true },
  { loc: AppPath.VerifyEmail, isLogged: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: true },
  { loc: AppPath.VerifyEmail, isLogged: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.VerifyEmail, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.VerifyEmail, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.VerifyEmail, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.VerifyEmail, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.VerifyEmail, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: true },

  { loc: AppPath.SignInUp, isLogged: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.SignInUp, isLogged: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: true },
  { loc: AppPath.SignInUp, isLogged: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: true },
  { loc: AppPath.SignInUp, isLogged: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: true },
  { loc: AppPath.SignInUp, isLogged: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.SignInUp, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.SignInUp, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.SignInUp, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.SignInUp, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.SignInUp, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: true },

  { loc: AppPath.Invite, isLogged: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.Invite, isLogged: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: true },
  { loc: AppPath.Invite, isLogged: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: true },
  { loc: AppPath.Invite, isLogged: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: true },
  { loc: AppPath.Invite, isLogged: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.Invite, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.Invite, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.Invite, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.Invite, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.Invite, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: true },

  { loc: AppPath.ResetPassword, isLogged: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.ResetPassword, isLogged: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: true },
  { loc: AppPath.ResetPassword, isLogged: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: true },
  { loc: AppPath.ResetPassword, isLogged: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: true },
  { loc: AppPath.ResetPassword, isLogged: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.ResetPassword, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.ResetPassword, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.ResetPassword, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.ResetPassword, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.ResetPassword, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: true },

  { loc: AppPath.CreateWorkspace, isLogged: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.CreateWorkspace, isLogged: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.CreateWorkspace, isLogged: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.CreateWorkspace, isLogged: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.CreateWorkspace, isLogged: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.CreateWorkspace, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.CreateWorkspace, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.CreateWorkspace, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.CreateWorkspace, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.CreateWorkspace, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.CreateProfile, isLogged: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.CreateProfile, isLogged: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.CreateProfile, isLogged: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.CreateProfile, isLogged: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.CreateProfile, isLogged: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.CreateProfile, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.CreateProfile, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.CreateProfile, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.CreateProfile, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.CreateProfile, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.SyncEmails, isLogged: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.SyncEmails, isLogged: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.SyncEmails, isLogged: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.SyncEmails, isLogged: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.SyncEmails, isLogged: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.SyncEmails, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.SyncEmails, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.SyncEmails, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.SyncEmails, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.SyncEmails, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.InviteTeam, isLogged: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.InviteTeam, isLogged: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.InviteTeam, isLogged: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.InviteTeam, isLogged: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.InviteTeam, isLogged: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.InviteTeam, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.InviteTeam, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.InviteTeam, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.InviteTeam, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.InviteTeam, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.PlanRequired, isLogged: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.PlanRequired, isLogged: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: true },
  { loc: AppPath.PlanRequired, isLogged: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.PlanRequired, isLogged: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.PlanRequired, isLogged: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.PlanRequired, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.PlanRequired, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.PlanRequired, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.PlanRequired, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.PlanRequired, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.PlanRequiredSuccess, isLogged: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.PlanRequiredSuccess, isLogged: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.PlanRequiredSuccess, isLogged: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.PlanRequiredSuccess, isLogged: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.PlanRequiredSuccess, isLogged: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.PlanRequiredSuccess, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.PlanRequiredSuccess, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.PlanRequiredSuccess, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.PlanRequiredSuccess, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.PlanRequiredSuccess, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.Index, isLogged: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.Index, isLogged: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.Index, isLogged: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.Index, isLogged: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.Index, isLogged: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.Index, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.Index, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.Index, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.Index, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.Index, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.TasksPage, isLogged: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.TasksPage, isLogged: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.TasksPage, isLogged: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.TasksPage, isLogged: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.TasksPage, isLogged: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.TasksPage, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.TasksPage, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.TasksPage, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.TasksPage, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.TasksPage, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.OpportunitiesPage, isLogged: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.OpportunitiesPage, isLogged: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.OpportunitiesPage, isLogged: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.OpportunitiesPage, isLogged: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.OpportunitiesPage, isLogged: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.OpportunitiesPage, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.OpportunitiesPage, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.OpportunitiesPage, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.OpportunitiesPage, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.OpportunitiesPage, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.RecordIndexPage, isLogged: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.RecordIndexPage, isLogged: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.RecordIndexPage, isLogged: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.RecordIndexPage, isLogged: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.RecordIndexPage, isLogged: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.RecordIndexPage, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.RecordIndexPage, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.RecordIndexPage, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.RecordIndexPage, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.RecordIndexPage, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.RecordShowPage, isLogged: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.RecordShowPage, isLogged: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.RecordShowPage, isLogged: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.RecordShowPage, isLogged: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.RecordShowPage, isLogged: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.RecordShowPage, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.RecordShowPage, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.RecordShowPage, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.RecordShowPage, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.RecordShowPage, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.SettingsCatchAll, isLogged: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.SettingsCatchAll, isLogged: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.SettingsCatchAll, isLogged: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.SettingsCatchAll, isLogged: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.SettingsCatchAll, isLogged: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.SettingsCatchAll, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.SettingsCatchAll, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.SettingsCatchAll, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.SettingsCatchAll, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.SettingsCatchAll, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.DevelopersCatchAll, isLogged: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.DevelopersCatchAll, isLogged: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.DevelopersCatchAll, isLogged: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.DevelopersCatchAll, isLogged: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.DevelopersCatchAll, isLogged: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.DevelopersCatchAll, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.DevelopersCatchAll, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.DevelopersCatchAll, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.DevelopersCatchAll, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.DevelopersCatchAll, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.Authorize, isLogged: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.Authorize, isLogged: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.Authorize, isLogged: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.Authorize, isLogged: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.Authorize, isLogged: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.Authorize, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.Authorize, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.Authorize, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.Authorize, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.Authorize, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.NotFoundWildcard, isLogged: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.NotFoundWildcard, isLogged: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.NotFoundWildcard, isLogged: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.NotFoundWildcard, isLogged: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.NotFoundWildcard, isLogged: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.NotFoundWildcard, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.NotFoundWildcard, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.NotFoundWildcard, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.NotFoundWildcard, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.NotFoundWildcard, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.NotFound, isLogged: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.NotFound, isLogged: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.NotFound, isLogged: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.NotFound, isLogged: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.NotFound, isLogged: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.NotFound, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.NotFound, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.NotFound, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.NotFound, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.NotFound, isLogged: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },
];

describe('useShowAuthModal', () => {
  testCases.forEach((testCase) => {
    it(`testCase for location ${testCase.loc} with onboardingStatus ${testCase.onboardingStatus} should return ${testCase.res}`, () => {
      setupMockOnboardingStatus(testCase.onboardingStatus);
      setupMockSubscriptionStatus(testCase.subscriptionStatus);
      setupMockIsMatchingLocation(testCase.loc);
      setupMockIsLogged(testCase.isLogged);
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
      setupMockSubscriptionStatus(SubscriptionStatus.Active);
      setupMockIsMatchingLocation(AppPath.Invite);
      setupMockIsLogged(true);
      const { result } = getResult(false);
      expect(result.current).toBeFalsy();
    });
    it(`with appPath ${AppPath.ResetPassword} and isDefaultLayoutAuthModalVisible=false`, () => {
      setupMockOnboardingStatus(OnboardingStatus.Completed);
      setupMockSubscriptionStatus(SubscriptionStatus.Active);
      setupMockIsMatchingLocation(AppPath.ResetPassword);
      setupMockIsLogged(true);
      const { result } = getResult(false);
      expect(result.current).toBeFalsy();
    });
  });

  describe('tests should be exhaustive', () => {
    it('all location and onboarding status should be tested', () => {
      const untestedSubscriptionStatus = [
        SubscriptionStatus.Active,
        SubscriptionStatus.IncompleteExpired,
        SubscriptionStatus.Paused,
        SubscriptionStatus.Trialing,
      ];
      expect(testCases.length).toEqual(
        (Object.keys(AppPath).length - UNTESTED_APP_PATHS.length) *
          (Object.keys(OnboardingStatus).length +
            (Object.keys(SubscriptionStatus).length -
              untestedSubscriptionStatus.length)),
      );
    });
  });
});
