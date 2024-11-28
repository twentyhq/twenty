import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { AppPath } from '@/types/AppPath';

import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { OnboardingStatus, SubscriptionStatus } from '~/generated/graphql';

import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';
import { usePageChangeEffectNavigateLocation } from '~/hooks/usePageChangeEffectNavigateLocation';
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

jest.mock('~/hooks/useIsMatchingLocation');
const mockUseIsMatchingLocation = jest.mocked(useIsMatchingLocation);

const setupMockIsMatchingLocation = (pathname: string) => {
  mockUseIsMatchingLocation.mockReturnValueOnce(
    (path: string) => path === pathname,
  );
};

jest.mock('@/auth/hooks/useIsLogged');
const setupMockIsLogged = (isLogged: boolean) => {
  jest.mocked(useIsLogged).mockReturnValueOnce(isLogged);
};

const defaultHomePagePath = '/objects/companies';

jest.mock('@/navigation/hooks/useDefaultHomePagePath');
jest.mocked(useDefaultHomePagePath).mockReturnValue({
  defaultHomePagePath,
});

// prettier-ignore
const testCases = [
  { loc: AppPath.Verify, isLoggedIn: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.Verify, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.Verify, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.Verify, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.Verify, isLoggedIn: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: undefined },
  { loc: AppPath.Verify, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.Verify, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.Verify, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.Verify, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.Verify, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },

  { loc: AppPath.SignInUp, isLoggedIn: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.SignInUp, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.SignInUp, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.SignInUp, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.SignInUp, isLoggedIn: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: undefined },
  { loc: AppPath.SignInUp, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.SignInUp, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.SignInUp, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.SignInUp, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.SignInUp, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },

  { loc: AppPath.Invite, isLoggedIn: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: undefined },
  { loc: AppPath.Invite, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.Invite, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.Invite, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.Invite, isLoggedIn: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: undefined },
  { loc: AppPath.Invite, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: undefined },
  { loc: AppPath.Invite, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: undefined },
  { loc: AppPath.Invite, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: undefined },
  { loc: AppPath.Invite, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: undefined },
  { loc: AppPath.Invite, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: undefined },

  { loc: AppPath.ResetPassword, isLoggedIn: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: undefined },
  { loc: AppPath.ResetPassword, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.ResetPassword, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.ResetPassword, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.ResetPassword, isLoggedIn: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: undefined },
  { loc: AppPath.ResetPassword, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: undefined },
  { loc: AppPath.ResetPassword, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: undefined },
  { loc: AppPath.ResetPassword, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: undefined },
  { loc: AppPath.ResetPassword, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: undefined },
  { loc: AppPath.ResetPassword, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: undefined },

  { loc: AppPath.CreateWorkspace, isLoggedIn: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.CreateWorkspace, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.CreateWorkspace, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.CreateWorkspace, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.CreateWorkspace, isLoggedIn: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.CreateWorkspace, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: undefined },
  { loc: AppPath.CreateWorkspace, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.CreateWorkspace, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.CreateWorkspace, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.CreateWorkspace, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },

  { loc: AppPath.CreateProfile, isLoggedIn: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.CreateProfile, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.CreateProfile, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.CreateProfile, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.CreateProfile, isLoggedIn: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.CreateProfile, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.CreateProfile, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: undefined },
  { loc: AppPath.CreateProfile, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.CreateProfile, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.CreateProfile, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },

  { loc: AppPath.SyncEmails, isLoggedIn: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.SyncEmails, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.SyncEmails, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.SyncEmails, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.SyncEmails, isLoggedIn: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.SyncEmails, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.SyncEmails, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.SyncEmails, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: undefined },
  { loc: AppPath.SyncEmails, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.SyncEmails, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },

  { loc: AppPath.InviteTeam, isLoggedIn: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.InviteTeam, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.InviteTeam, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.InviteTeam, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.InviteTeam, isLoggedIn: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.InviteTeam, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.InviteTeam, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.InviteTeam, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.InviteTeam, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: undefined },
  { loc: AppPath.InviteTeam, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },

  { loc: AppPath.PlanRequired, isLoggedIn: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: undefined },
  { loc: AppPath.PlanRequired, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.PlanRequired, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.PlanRequired, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.PlanRequired, isLoggedIn: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.PlanRequired, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.PlanRequired, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.PlanRequired, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.PlanRequired, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.PlanRequired, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },

  { loc: AppPath.PlanRequiredSuccess, isLoggedIn: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.PlanRequiredSuccess, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.PlanRequiredSuccess, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.PlanRequiredSuccess, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.PlanRequiredSuccess, isLoggedIn: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.PlanRequiredSuccess, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: undefined },
  { loc: AppPath.PlanRequiredSuccess, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.PlanRequiredSuccess, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.PlanRequiredSuccess, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.PlanRequiredSuccess, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },

  { loc: AppPath.Index, isLoggedIn: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.Index, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.Index, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.Index, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.Index, isLoggedIn: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.Index, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.Index, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.Index, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.Index, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.Index, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },

  { loc: AppPath.TasksPage, isLoggedIn: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.TasksPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.TasksPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.TasksPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.TasksPage, isLoggedIn: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.TasksPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.TasksPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.TasksPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.TasksPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.TasksPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: undefined },

  { loc: AppPath.OpportunitiesPage, isLoggedIn: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.OpportunitiesPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.OpportunitiesPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.OpportunitiesPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.OpportunitiesPage, isLoggedIn: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.OpportunitiesPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.OpportunitiesPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.OpportunitiesPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.OpportunitiesPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.OpportunitiesPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: undefined },

  { loc: AppPath.RecordIndexPage, isLoggedIn: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.RecordIndexPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.RecordIndexPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.RecordIndexPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.RecordIndexPage, isLoggedIn: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.RecordIndexPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.RecordIndexPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.RecordIndexPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.RecordIndexPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.RecordIndexPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: undefined },

  { loc: AppPath.RecordShowPage, isLoggedIn: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.RecordShowPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.RecordShowPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.RecordShowPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.RecordShowPage, isLoggedIn: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.RecordShowPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.RecordShowPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.RecordShowPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.RecordShowPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.RecordShowPage, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: undefined },

  { loc: AppPath.SettingsCatchAll, isLoggedIn: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.SettingsCatchAll, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.SettingsCatchAll, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.SettingsCatchAll, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.SettingsCatchAll, isLoggedIn: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.SettingsCatchAll, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.SettingsCatchAll, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.SettingsCatchAll, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.SettingsCatchAll, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.SettingsCatchAll, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: undefined },

  { loc: AppPath.DevelopersCatchAll, isLoggedIn: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.DevelopersCatchAll, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.DevelopersCatchAll, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.DevelopersCatchAll, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.DevelopersCatchAll, isLoggedIn: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.DevelopersCatchAll, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.DevelopersCatchAll, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.DevelopersCatchAll, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.DevelopersCatchAll, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.DevelopersCatchAll, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: undefined },

  { loc: AppPath.Authorize, isLoggedIn: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.Authorize, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.Authorize, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.Authorize, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.Authorize, isLoggedIn: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.Authorize, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.Authorize, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.Authorize, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.Authorize, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.Authorize, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: undefined },

  { loc: AppPath.NotFoundWildcard, isLoggedIn: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.NotFoundWildcard, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.NotFoundWildcard, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.NotFoundWildcard, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.NotFoundWildcard, isLoggedIn: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.NotFoundWildcard, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.NotFoundWildcard, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.NotFoundWildcard, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.NotFoundWildcard, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.NotFoundWildcard, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: undefined },

  { loc: AppPath.NotFound, isLoggedIn: true, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.NotFound, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.NotFound, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.NotFound, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.NotFound, isLoggedIn: false, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.NotFound, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.NotFound, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.NotFound, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.NotFound, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.NotFound, isLoggedIn: true, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: undefined },
];

describe('usePageChangeEffectNavigateLocation', () => {
  testCases.forEach((testCase) => {
    it(`with location ${testCase.loc} and onboardingStatus ${testCase.onboardingStatus} and subscriptionStatus ${testCase.subscriptionStatus} should return ${testCase.res}`, () => {
      setupMockIsMatchingLocation(testCase.loc);
      setupMockOnboardingStatus(testCase.onboardingStatus);
      setupMockSubscriptionStatus(testCase.subscriptionStatus);
      setupMockIsLogged(testCase.isLoggedIn);
      expect(usePageChangeEffectNavigateLocation()).toEqual(testCase.res);
    });
  });

  describe('tests should be exhaustive', () => {
    it('all location and onboarding status should be tested', () => {
      const untestedSubscriptionStatus = [
        SubscriptionStatus.Incomplete,
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
