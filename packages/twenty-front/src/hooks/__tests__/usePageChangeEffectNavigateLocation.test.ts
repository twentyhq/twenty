import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { AppPath } from '@/types/AppPath';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { useWorkspaceHasSubscription } from '@/workspace/hooks/useWorkspaceHasSubscription';
import { OnboardingStatus, SubscriptionStatus } from '~/generated/graphql';
import { useDefaultHomePagePath } from '~/hooks/useDefaultHomePagePath';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';
import { usePageChangeEffectNavigateLocation } from '~/hooks/usePageChangeEffectNavigateLocation';

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

const defaultHomePagePath = '/objects/companies';

jest.mock('~/hooks/useDefaultHomePagePath');
jest.mocked(useDefaultHomePagePath).mockReturnValue({
  defaultHomePagePath,
});

// prettier-ignore
const testCases = [
  { loc: AppPath.Verify, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.Verify, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.Verify, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.Verify, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.Verify, subscriptionStatus: undefined, onboardingStatus: undefined, res: undefined },
  { loc: AppPath.Verify, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.Verify, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.Verify, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.Verify, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.Verify, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },

  { loc: AppPath.SignInUp, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.SignInUp, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.SignInUp, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.SignInUp, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.SignInUp, subscriptionStatus: undefined, onboardingStatus: undefined, res: undefined },
  { loc: AppPath.SignInUp, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.SignInUp, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.SignInUp, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.SignInUp, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.SignInUp, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },

  { loc: AppPath.Invite, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: undefined },
  { loc: AppPath.Invite, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.Invite, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.Invite, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.Invite, subscriptionStatus: undefined, onboardingStatus: undefined, res: undefined },
  { loc: AppPath.Invite, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: undefined },
  { loc: AppPath.Invite, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: undefined },
  { loc: AppPath.Invite, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: undefined },
  { loc: AppPath.Invite, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: undefined },
  { loc: AppPath.Invite, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: undefined },

  { loc: AppPath.ResetPassword, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: undefined },
  { loc: AppPath.ResetPassword, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.ResetPassword, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.ResetPassword, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.ResetPassword, subscriptionStatus: undefined, onboardingStatus: undefined, res: undefined },
  { loc: AppPath.ResetPassword, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: undefined },
  { loc: AppPath.ResetPassword, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: undefined },
  { loc: AppPath.ResetPassword, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: undefined },
  { loc: AppPath.ResetPassword, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: undefined },
  { loc: AppPath.ResetPassword, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: undefined },

  { loc: AppPath.CreateWorkspace, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.CreateWorkspace, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.CreateWorkspace, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.CreateWorkspace, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.CreateWorkspace, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.CreateWorkspace, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: undefined },
  { loc: AppPath.CreateWorkspace, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.CreateWorkspace, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.CreateWorkspace, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.CreateWorkspace, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },

  { loc: AppPath.CreateProfile, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.CreateProfile, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.CreateProfile, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.CreateProfile, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.CreateProfile, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.CreateProfile, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.CreateProfile, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: undefined },
  { loc: AppPath.CreateProfile, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.CreateProfile, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.CreateProfile, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },

  { loc: AppPath.SyncEmails, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.SyncEmails, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.SyncEmails, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.SyncEmails, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.SyncEmails, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.SyncEmails, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.SyncEmails, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.SyncEmails, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: undefined },
  { loc: AppPath.SyncEmails, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.SyncEmails, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },

  { loc: AppPath.InviteTeam, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.InviteTeam, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.InviteTeam, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.InviteTeam, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.InviteTeam, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.InviteTeam, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.InviteTeam, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.InviteTeam, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.InviteTeam, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: undefined },
  { loc: AppPath.InviteTeam, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },

  { loc: AppPath.PlanRequired, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: undefined },
  { loc: AppPath.PlanRequired, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.PlanRequired, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.PlanRequired, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.PlanRequired, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.PlanRequired, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.PlanRequired, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.PlanRequired, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.PlanRequired, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.PlanRequired, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },

  { loc: AppPath.PlanRequiredSuccess, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.PlanRequiredSuccess, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.PlanRequiredSuccess, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.PlanRequiredSuccess, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.PlanRequiredSuccess, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.PlanRequiredSuccess, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: undefined },
  { loc: AppPath.PlanRequiredSuccess, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.PlanRequiredSuccess, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.PlanRequiredSuccess, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.PlanRequiredSuccess, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },

  { loc: AppPath.Index, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.Index, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.Index, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.Index, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.Index, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.Index, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.Index, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.Index, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.Index, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.Index, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: defaultHomePagePath },

  { loc: AppPath.TasksPage, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.TasksPage, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.TasksPage, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.TasksPage, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.TasksPage, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.TasksPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.TasksPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.TasksPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.TasksPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.TasksPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: undefined },

  { loc: AppPath.OpportunitiesPage, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.OpportunitiesPage, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.OpportunitiesPage, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.OpportunitiesPage, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.OpportunitiesPage, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.OpportunitiesPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.OpportunitiesPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.OpportunitiesPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.OpportunitiesPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.OpportunitiesPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: undefined },

  { loc: AppPath.RecordIndexPage, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.RecordIndexPage, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.RecordIndexPage, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.RecordIndexPage, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.RecordIndexPage, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.RecordIndexPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.RecordIndexPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.RecordIndexPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.RecordIndexPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.RecordIndexPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: undefined },

  { loc: AppPath.RecordShowPage, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.RecordShowPage, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.RecordShowPage, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.RecordShowPage, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.RecordShowPage, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.RecordShowPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.RecordShowPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.RecordShowPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.RecordShowPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.RecordShowPage, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: undefined },

  { loc: AppPath.SettingsCatchAll, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.SettingsCatchAll, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.SettingsCatchAll, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.SettingsCatchAll, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.SettingsCatchAll, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.SettingsCatchAll, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.SettingsCatchAll, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.SettingsCatchAll, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.SettingsCatchAll, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.SettingsCatchAll, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: undefined },

  { loc: AppPath.DevelopersCatchAll, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.DevelopersCatchAll, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.DevelopersCatchAll, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.DevelopersCatchAll, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.DevelopersCatchAll, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.DevelopersCatchAll, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.DevelopersCatchAll, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.DevelopersCatchAll, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.DevelopersCatchAll, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.DevelopersCatchAll, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: undefined },

  { loc: AppPath.Impersonate, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.Impersonate, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.Impersonate, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.Impersonate, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.Impersonate, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.Impersonate, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.Impersonate, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.Impersonate, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.Impersonate, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.Impersonate, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: undefined },

  { loc: AppPath.Authorize, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.Authorize, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.Authorize, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.Authorize, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.Authorize, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.Authorize, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.Authorize, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.Authorize, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.Authorize, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.Authorize, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: undefined },

  { loc: AppPath.NotFoundWildcard, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.NotFoundWildcard, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.NotFoundWildcard, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.NotFoundWildcard, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.NotFoundWildcard, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.NotFoundWildcard, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.NotFoundWildcard, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.NotFoundWildcard, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.NotFoundWildcard, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.NotFoundWildcard, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: undefined },

  { loc: AppPath.NotFound, subscriptionStatus: undefined, onboardingStatus: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.NotFound, subscriptionStatus: SubscriptionStatus.Canceled, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.NotFound, subscriptionStatus: SubscriptionStatus.Unpaid, onboardingStatus: OnboardingStatus.Completed, res: '/settings/billing' },
  { loc: AppPath.NotFound, subscriptionStatus: SubscriptionStatus.PastDue, onboardingStatus: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.NotFound, subscriptionStatus: undefined, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.NotFound, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.NotFound, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.NotFound, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.NotFound, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.NotFound, subscriptionStatus: SubscriptionStatus.Active, onboardingStatus: OnboardingStatus.Completed, res: undefined },
];

describe('usePageChangeEffectNavigateLocation', () => {
  testCases.forEach((testCase) => {
    it(`with location ${testCase.loc} and onboardingStatus ${testCase.onboardingStatus} and subscriptionStatus ${testCase.subscriptionStatus} should return ${testCase.res}`, () => {
      setupMockIsMatchingLocation(testCase.loc);
      setupMockOnboardingStatus(testCase.onboardingStatus);
      setupMockSubscriptionStatus(testCase.subscriptionStatus);
      setupMockWorkspaceHasSubscription();
      expect(usePageChangeEffectNavigateLocation()).toEqual(testCase.res);
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
