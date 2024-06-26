import { renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { AppPath } from '@/types/AppPath';
import { useShowAuthModal } from '@/ui/layout/hooks/useShowAuthModal';
import { isDefaultLayoutAuthModalVisibleState } from '@/ui/layout/states/isDefaultLayoutAuthModalVisibleState';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { useWorkspaceHasSubscription } from '@/workspace/hooks/useWorkspaceHasSubscription';
import { OnboardingStatus, SubscriptionStatus } from '~/generated/graphql';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';

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

jest.mock('@/workspace/hooks/useWorkspaceHasSubscription');
const setupMockWorkspaceHasSubscription = (workspaceHasSubscription = true) => {
  jest
    .mocked(useWorkspaceHasSubscription)
    .mockReturnValueOnce(workspaceHasSubscription);
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
  { loc: AppPath.Verify, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: false },
  { loc: AppPath.Verify, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.Verify, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.Verify, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.Verify, subscriptionStatus: undefined, onboardingStatus: undefined, res: false },
  { loc: AppPath.Verify, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: false },
  { loc: AppPath.Verify, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: false },
  { loc: AppPath.Verify, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: false },
  { loc: AppPath.Verify, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: false },
  { loc: AppPath.Verify, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.SignInUp, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.SignInUp, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.SignInUp, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.SignInUp, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.SignInUp, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.SignInUp, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.SignInUp, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.SignInUp, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.SignInUp, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.SignInUp, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.Invite, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.Invite, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: true },
  { loc: AppPath.Invite, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: true },
  { loc: AppPath.Invite, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: true },
  { loc: AppPath.Invite, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.Invite, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.Invite, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.Invite, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.Invite, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.Invite, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: true },

  { loc: AppPath.ResetPassword, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.ResetPassword, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: true },
  { loc: AppPath.ResetPassword, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: true },
  { loc: AppPath.ResetPassword, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: true },
  { loc: AppPath.ResetPassword, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.ResetPassword, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.ResetPassword, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.ResetPassword, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.ResetPassword, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.ResetPassword, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: true },

  { loc: AppPath.CreateWorkspace, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.CreateWorkspace, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.CreateWorkspace, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.CreateWorkspace, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.CreateWorkspace, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.CreateWorkspace, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.CreateWorkspace, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.CreateWorkspace, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.CreateWorkspace, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.CreateWorkspace, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.CreateProfile, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.CreateProfile, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.CreateProfile, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.CreateProfile, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.CreateProfile, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.CreateProfile, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.CreateProfile, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.CreateProfile, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.CreateProfile, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.CreateProfile, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.SyncEmails, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.SyncEmails, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.SyncEmails, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.SyncEmails, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.SyncEmails, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.SyncEmails, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.SyncEmails, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.SyncEmails, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.SyncEmails, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.SyncEmails, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.InviteTeam, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.InviteTeam, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.InviteTeam, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.InviteTeam, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.InviteTeam, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.InviteTeam, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.InviteTeam, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.InviteTeam, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.InviteTeam, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.InviteTeam, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.PlanRequired, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.PlanRequired, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: true },
  { loc: AppPath.PlanRequired, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.PlanRequired, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.PlanRequired, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.PlanRequired, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.PlanRequired, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.PlanRequired, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.PlanRequired, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.PlanRequired, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.PlanRequiredSuccess, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.PlanRequiredSuccess, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.PlanRequiredSuccess, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.PlanRequiredSuccess, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.PlanRequiredSuccess, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.PlanRequiredSuccess, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.PlanRequiredSuccess, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.PlanRequiredSuccess, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.PlanRequiredSuccess, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.PlanRequiredSuccess, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.Index, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.Index, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.Index, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.Index, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.Index, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.Index, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.Index, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.Index, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.Index, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.Index, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.TasksPage, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.TasksPage, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.TasksPage, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.TasksPage, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.TasksPage, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.TasksPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.TasksPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.TasksPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.TasksPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.TasksPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.OpportunitiesPage, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.OpportunitiesPage, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.OpportunitiesPage, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.OpportunitiesPage, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.OpportunitiesPage, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.OpportunitiesPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.OpportunitiesPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.OpportunitiesPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.OpportunitiesPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.OpportunitiesPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.RecordIndexPage, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.RecordIndexPage, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.RecordIndexPage, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.RecordIndexPage, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.RecordIndexPage, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.RecordIndexPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.RecordIndexPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.RecordIndexPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.RecordIndexPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.RecordIndexPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.RecordShowPage, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.RecordShowPage, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.RecordShowPage, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.RecordShowPage, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.RecordShowPage, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.RecordShowPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.RecordShowPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.RecordShowPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.RecordShowPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.RecordShowPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.SettingsCatchAll, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.SettingsCatchAll, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.SettingsCatchAll, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.SettingsCatchAll, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.SettingsCatchAll, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.SettingsCatchAll, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.SettingsCatchAll, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.SettingsCatchAll, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.SettingsCatchAll, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.SettingsCatchAll, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.DevelopersCatchAll, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.DevelopersCatchAll, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.DevelopersCatchAll, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.DevelopersCatchAll, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.DevelopersCatchAll, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.DevelopersCatchAll, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.DevelopersCatchAll, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.DevelopersCatchAll, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.DevelopersCatchAll, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.DevelopersCatchAll, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.Impersonate, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.Impersonate, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.Impersonate, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.Impersonate, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.Impersonate, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.Impersonate, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.Impersonate, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.Impersonate, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.Impersonate, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.Impersonate, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.Authorize, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.Authorize, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.Authorize, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.Authorize, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.Authorize, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.Authorize, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.Authorize, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.Authorize, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.Authorize, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.Authorize, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.NotFoundWildcard, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.NotFoundWildcard, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.NotFoundWildcard, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.NotFoundWildcard, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.NotFoundWildcard, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.NotFoundWildcard, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.NotFoundWildcard, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.NotFoundWildcard, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.NotFoundWildcard, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.NotFoundWildcard, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },

  { loc: AppPath.NotFound, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: true },
  { loc: AppPath.NotFound, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.NotFound, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.NotFound, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: false },
  { loc: AppPath.NotFound, subscriptionStatus: undefined, onboardingStatus: undefined, res: true },
  { loc: AppPath.NotFound, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: true },
  { loc: AppPath.NotFound, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: true },
  { loc: AppPath.NotFound, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: true },
  { loc: AppPath.NotFound, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: true },
  { loc: AppPath.NotFound, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: false },
];

describe('useShowAuthModal', () => {
  testCases.forEach((testCase) => {
    it(`testCase for location ${testCase.loc} with onboardingStatus ${testCase.onboardingStatus} should return ${testCase.res}`, () => {
      setupMockOnboardingStatus(testCase.onboardingStatus);
      setupMockSubscriptionStatus(testCase.subscriptionStatus);
      setupMockIsMatchingLocation(testCase.loc);
      setupMockWorkspaceHasSubscription();
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
      setupMockWorkspaceHasSubscription();
      const { result } = getResult(false);
      expect(result.current).toBeFalsy();
    });
    it(`with appPath ${AppPath.ResetPassword} and isDefaultLayoutAuthModalVisible=false`, () => {
      setupMockOnboardingStatus(OnboardingStatus.Completed);
      setupMockSubscriptionStatus(SubscriptionStatus.Active);
      setupMockIsMatchingLocation(AppPath.ResetPassword);
      setupMockWorkspaceHasSubscription();
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
        Object.keys(AppPath).length *
          (Object.keys(OnboardingStatus).length +
            (Object.keys(SubscriptionStatus).length -
              untestedSubscriptionStatus.length)),
      );
    });
  });
});
