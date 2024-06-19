import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { OnboardingStatus } from '@/auth/utils/getOnboardingStatus';
import { AppPath } from '@/types/AppPath';
import { OnboardingStep } from '~/generated/graphql';
import { useDefaultHomePagePath } from '~/hooks/useDefaultHomePagePath';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';
import { usePageChangeEffectNavigateLocation } from '~/hooks/usePageChangeEffectNavigateLocation';

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

const defaultHomePagePath = '/objects/companies';

jest.mock('~/hooks/useDefaultHomePagePath');
jest.mocked(useDefaultHomePagePath).mockReturnValue({
  defaultHomePagePath: '/objects/companies',
});

// prettier-ignore
const testCases = [
  { loc: AppPath.Verify, status: OnboardingStep.SubscriptionIncomplete, res: AppPath.PlanRequired },
  { loc: AppPath.Verify, status: OnboardingStep.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.Verify, status: OnboardingStep.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.Verify, status: OnboardingStep.SubscriptionPastDue, res: undefined },
  { loc: AppPath.Verify, status: OnboardingStep.UserCreation, res: undefined },
  { loc: AppPath.Verify, status: OnboardingStep.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.Verify, status: OnboardingStep.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.Verify, status: OnboardingStep.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.Verify, status: OnboardingStep.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.Verify, status: OnboardingStep.Completed, res: defaultHomePagePath },
  { loc: AppPath.Verify, status: OnboardingStep.CompletedWithoutSubscription, res: defaultHomePagePath },

  { loc: AppPath.SignInUp, status: OnboardingStep.SubscriptionIncomplete, res: AppPath.PlanRequired },
  { loc: AppPath.SignInUp, status: OnboardingStep.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.SignInUp, status: OnboardingStep.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.SignInUp, status: OnboardingStep.SubscriptionPastDue, res: undefined },
  { loc: AppPath.SignInUp, status: OnboardingStep.UserCreation, res: undefined },
  { loc: AppPath.SignInUp, status: OnboardingStep.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.SignInUp, status: OnboardingStep.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.SignInUp, status: OnboardingStep.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.SignInUp, status: OnboardingStep.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.SignInUp, status: OnboardingStep.Completed, res: defaultHomePagePath },
  { loc: AppPath.SignInUp, status: OnboardingStep.CompletedWithoutSubscription, res: defaultHomePagePath },

  { loc: AppPath.Invite, status: OnboardingStep.SubscriptionIncomplete, res: undefined },
  { loc: AppPath.Invite, status: OnboardingStep.SubscriptionCanceled, res: undefined },
  { loc: AppPath.Invite, status: OnboardingStep.SubscriptionUnpaid, res: undefined },
  { loc: AppPath.Invite, status: OnboardingStep.SubscriptionPastDue, res: undefined },
  { loc: AppPath.Invite, status: OnboardingStep.UserCreation, res: undefined },
  { loc: AppPath.Invite, status: OnboardingStep.WorkspaceActivation, res: undefined },
  { loc: AppPath.Invite, status: OnboardingStep.ProfileCreation, res: undefined },
  { loc: AppPath.Invite, status: OnboardingStep.SyncEmail, res: undefined },
  { loc: AppPath.Invite, status: OnboardingStep.InviteTeam, res: undefined },
  { loc: AppPath.Invite, status: OnboardingStep.Completed, res: undefined },
  { loc: AppPath.Invite, status: OnboardingStep.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.ResetPassword, status: OnboardingStep.SubscriptionIncomplete, res: undefined },
  { loc: AppPath.ResetPassword, status: OnboardingStep.SubscriptionCanceled, res: undefined },
  { loc: AppPath.ResetPassword, status: OnboardingStep.SubscriptionUnpaid, res: undefined },
  { loc: AppPath.ResetPassword, status: OnboardingStep.SubscriptionPastDue, res: undefined },
  { loc: AppPath.ResetPassword, status: OnboardingStep.UserCreation, res: undefined },
  { loc: AppPath.ResetPassword, status: OnboardingStep.WorkspaceActivation, res: undefined },
  { loc: AppPath.ResetPassword, status: OnboardingStep.ProfileCreation, res: undefined },
  { loc: AppPath.ResetPassword, status: OnboardingStep.SyncEmail, res: undefined },
  { loc: AppPath.ResetPassword, status: OnboardingStep.InviteTeam, res: undefined },
  { loc: AppPath.ResetPassword, status: OnboardingStep.Completed, res: undefined },
  { loc: AppPath.ResetPassword, status: OnboardingStep.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.CreateWorkspace, status: OnboardingStep.SubscriptionIncomplete, res: AppPath.PlanRequired },
  { loc: AppPath.CreateWorkspace, status: OnboardingStep.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.CreateWorkspace, status: OnboardingStep.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.CreateWorkspace, status: OnboardingStep.SubscriptionPastDue, res: undefined },
  { loc: AppPath.CreateWorkspace, status: OnboardingStep.UserCreation, res: AppPath.SignInUp },
  { loc: AppPath.CreateWorkspace, status: OnboardingStep.WorkspaceActivation, res: undefined },
  { loc: AppPath.CreateWorkspace, status: OnboardingStep.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.CreateWorkspace, status: OnboardingStep.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.CreateWorkspace, status: OnboardingStep.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.CreateWorkspace, status: OnboardingStep.Completed, res: defaultHomePagePath },
  { loc: AppPath.CreateWorkspace, status: OnboardingStep.CompletedWithoutSubscription, res: defaultHomePagePath },

  { loc: AppPath.CreateProfile, status: OnboardingStep.SubscriptionIncomplete, res: AppPath.PlanRequired },
  { loc: AppPath.CreateProfile, status: OnboardingStep.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.CreateProfile, status: OnboardingStep.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.CreateProfile, status: OnboardingStep.SubscriptionPastDue, res: undefined },
  { loc: AppPath.CreateProfile, status: OnboardingStep.UserCreation, res: AppPath.SignInUp },
  { loc: AppPath.CreateProfile, status: OnboardingStep.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.CreateProfile, status: OnboardingStep.ProfileCreation, res: undefined },
  { loc: AppPath.CreateProfile, status: OnboardingStep.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.CreateProfile, status: OnboardingStep.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.CreateProfile, status: OnboardingStep.Completed, res: defaultHomePagePath },
  { loc: AppPath.CreateProfile, status: OnboardingStep.CompletedWithoutSubscription, res: defaultHomePagePath },

  { loc: AppPath.SyncEmails, status: OnboardingStep.SubscriptionIncomplete, res: AppPath.PlanRequired },
  { loc: AppPath.SyncEmails, status: OnboardingStep.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.SyncEmails, status: OnboardingStep.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.SyncEmails, status: OnboardingStep.SubscriptionPastDue, res: undefined },
  { loc: AppPath.SyncEmails, status: OnboardingStep.UserCreation, res: AppPath.SignInUp },
  { loc: AppPath.SyncEmails, status: OnboardingStep.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.SyncEmails, status: OnboardingStep.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.SyncEmails, status: OnboardingStep.SyncEmail, res: undefined },
  { loc: AppPath.SyncEmails, status: OnboardingStep.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.SyncEmails, status: OnboardingStep.Completed, res: defaultHomePagePath },
  { loc: AppPath.SyncEmails, status: OnboardingStep.CompletedWithoutSubscription, res: defaultHomePagePath },

  { loc: AppPath.InviteTeam, status: OnboardingStep.SubscriptionIncomplete, res: AppPath.PlanRequired },
  { loc: AppPath.InviteTeam, status: OnboardingStep.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.InviteTeam, status: OnboardingStep.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.InviteTeam, status: OnboardingStep.SubscriptionPastDue, res: undefined },
  { loc: AppPath.InviteTeam, status: OnboardingStep.UserCreation, res: AppPath.SignInUp },
  { loc: AppPath.InviteTeam, status: OnboardingStep.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.InviteTeam, status: OnboardingStep.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.InviteTeam, status: OnboardingStep.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.InviteTeam, status: OnboardingStep.InviteTeam, res: undefined },
  { loc: AppPath.InviteTeam, status: OnboardingStep.Completed, res: defaultHomePagePath },
  { loc: AppPath.InviteTeam, status: OnboardingStep.CompletedWithoutSubscription, res: defaultHomePagePath },

  { loc: AppPath.PlanRequired, status: OnboardingStep.SubscriptionIncomplete, res: undefined },
  { loc: AppPath.PlanRequired, status: OnboardingStep.SubscriptionCanceled, res: undefined },
  { loc: AppPath.PlanRequired, status: OnboardingStep.SubscriptionUnpaid, res: undefined },
  { loc: AppPath.PlanRequired, status: OnboardingStep.SubscriptionPastDue, res: undefined },
  { loc: AppPath.PlanRequired, status: OnboardingStep.UserCreation, res: AppPath.SignInUp },
  { loc: AppPath.PlanRequired, status: OnboardingStep.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.PlanRequired, status: OnboardingStep.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.PlanRequired, status: OnboardingStep.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.PlanRequired, status: OnboardingStep.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.PlanRequired, status: OnboardingStep.Completed, res: defaultHomePagePath },
  { loc: AppPath.PlanRequired, status: OnboardingStep.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStep.SubscriptionIncomplete, res: AppPath.PlanRequired },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStep.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStep.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStep.SubscriptionPastDue, res: undefined },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStep.UserCreation, res: AppPath.SignInUp },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStep.WorkspaceActivation, res: undefined },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStep.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStep.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStep.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStep.Completed, res: defaultHomePagePath },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStep.CompletedWithoutSubscription, res: defaultHomePagePath },

  { loc: AppPath.Index, status: OnboardingStep.SubscriptionIncomplete, res: AppPath.PlanRequired },
  { loc: AppPath.Index, status: OnboardingStep.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.Index, status: OnboardingStep.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.Index, status: OnboardingStep.SubscriptionPastDue, res: defaultHomePagePath },
  { loc: AppPath.Index, status: OnboardingStep.UserCreation, res: AppPath.SignInUp },
  { loc: AppPath.Index, status: OnboardingStep.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.Index, status: OnboardingStep.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.Index, status: OnboardingStep.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.Index, status: OnboardingStep.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.Index, status: OnboardingStep.Completed, res: defaultHomePagePath },
  { loc: AppPath.Index, status: OnboardingStep.CompletedWithoutSubscription, res: defaultHomePagePath },

  { loc: AppPath.TasksPage, status: OnboardingStep.SubscriptionIncomplete, res: AppPath.PlanRequired },
  { loc: AppPath.TasksPage, status: OnboardingStep.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.TasksPage, status: OnboardingStep.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.TasksPage, status: OnboardingStep.SubscriptionPastDue, res: undefined },
  { loc: AppPath.TasksPage, status: OnboardingStep.UserCreation, res: AppPath.SignInUp },
  { loc: AppPath.TasksPage, status: OnboardingStep.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.TasksPage, status: OnboardingStep.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.TasksPage, status: OnboardingStep.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.TasksPage, status: OnboardingStep.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.TasksPage, status: OnboardingStep.Completed, res: undefined },
  { loc: AppPath.TasksPage, status: OnboardingStep.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.OpportunitiesPage, status: OnboardingStep.SubscriptionIncomplete, res: AppPath.PlanRequired },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStep.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStep.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStep.SubscriptionPastDue, res: undefined },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStep.UserCreation, res: AppPath.SignInUp },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStep.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStep.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStep.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStep.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStep.Completed, res: undefined },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStep.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.RecordIndexPage, status: OnboardingStep.SubscriptionIncomplete, res: AppPath.PlanRequired },
  { loc: AppPath.RecordIndexPage, status: OnboardingStep.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.RecordIndexPage, status: OnboardingStep.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.RecordIndexPage, status: OnboardingStep.SubscriptionPastDue, res: undefined },
  { loc: AppPath.RecordIndexPage, status: OnboardingStep.UserCreation, res: AppPath.SignInUp },
  { loc: AppPath.RecordIndexPage, status: OnboardingStep.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.RecordIndexPage, status: OnboardingStep.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.RecordIndexPage, status: OnboardingStep.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.RecordIndexPage, status: OnboardingStep.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.RecordIndexPage, status: OnboardingStep.Completed, res: undefined },
  { loc: AppPath.RecordIndexPage, status: OnboardingStep.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.RecordShowPage, status: OnboardingStep.SubscriptionIncomplete, res: AppPath.PlanRequired },
  { loc: AppPath.RecordShowPage, status: OnboardingStep.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.RecordShowPage, status: OnboardingStep.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.RecordShowPage, status: OnboardingStep.SubscriptionPastDue, res: undefined },
  { loc: AppPath.RecordShowPage, status: OnboardingStep.UserCreation, res: AppPath.SignInUp },
  { loc: AppPath.RecordShowPage, status: OnboardingStep.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.RecordShowPage, status: OnboardingStep.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.RecordShowPage, status: OnboardingStep.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.RecordShowPage, status: OnboardingStep.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.RecordShowPage, status: OnboardingStep.Completed, res: undefined },
  { loc: AppPath.RecordShowPage, status: OnboardingStep.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.SettingsCatchAll, status: OnboardingStep.SubscriptionIncomplete, res: AppPath.PlanRequired },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStep.SubscriptionCanceled, res: undefined },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStep.SubscriptionUnpaid, res: undefined },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStep.SubscriptionPastDue, res: undefined },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStep.UserCreation, res: AppPath.SignInUp },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStep.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStep.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStep.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStep.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStep.Completed, res: undefined },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStep.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.DevelopersCatchAll, status: OnboardingStep.SubscriptionIncomplete, res: AppPath.PlanRequired },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStep.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStep.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStep.SubscriptionPastDue, res: undefined },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStep.UserCreation, res: AppPath.SignInUp },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStep.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStep.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStep.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStep.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStep.Completed, res: undefined },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStep.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.Impersonate, status: OnboardingStep.SubscriptionIncomplete, res: AppPath.PlanRequired },
  { loc: AppPath.Impersonate, status: OnboardingStep.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.Impersonate, status: OnboardingStep.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.Impersonate, status: OnboardingStep.SubscriptionPastDue, res: undefined },
  { loc: AppPath.Impersonate, status: OnboardingStep.UserCreation, res: AppPath.SignInUp },
  { loc: AppPath.Impersonate, status: OnboardingStep.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.Impersonate, status: OnboardingStep.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.Impersonate, status: OnboardingStep.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.Impersonate, status: OnboardingStep.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.Impersonate, status: OnboardingStep.Completed, res: undefined },
  { loc: AppPath.Impersonate, status: OnboardingStep.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.Authorize, status: OnboardingStep.SubscriptionIncomplete, res: AppPath.PlanRequired },
  { loc: AppPath.Authorize, status: OnboardingStep.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.Authorize, status: OnboardingStep.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.Authorize, status: OnboardingStep.SubscriptionPastDue, res: undefined },
  { loc: AppPath.Authorize, status: OnboardingStep.UserCreation, res: AppPath.SignInUp },
  { loc: AppPath.Authorize, status: OnboardingStep.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.Authorize, status: OnboardingStep.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.Authorize, status: OnboardingStep.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.Authorize, status: OnboardingStep.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.Authorize, status: OnboardingStep.Completed, res: undefined },
  { loc: AppPath.Authorize, status: OnboardingStep.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.NotFoundWildcard, status: OnboardingStep.SubscriptionIncomplete, res: AppPath.PlanRequired },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStep.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStep.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStep.SubscriptionPastDue, res: undefined },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStep.UserCreation, res: AppPath.SignInUp },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStep.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStep.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStep.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStep.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStep.Completed, res: undefined },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStep.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.NotFound, status: OnboardingStep.SubscriptionIncomplete, res: AppPath.PlanRequired },
  { loc: AppPath.NotFound, status: OnboardingStep.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.NotFound, status: OnboardingStep.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.NotFound, status: OnboardingStep.SubscriptionPastDue, res: undefined },
  { loc: AppPath.NotFound, status: OnboardingStep.UserCreation, res: AppPath.SignInUp },
  { loc: AppPath.NotFound, status: OnboardingStep.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.NotFound, status: OnboardingStep.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.NotFound, status: OnboardingStep.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.NotFound, status: OnboardingStep.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.NotFound, status: OnboardingStep.Completed, res: undefined },
  { loc: AppPath.NotFound, status: OnboardingStep.CompletedWithoutSubscription, res: undefined },
];

describe('usePageChangeEffectNavigateLocation', () => {
  testCases.forEach((testCase) => {
    it(`with location ${testCase.loc} and onboardingStatus ${testCase.status} should return ${testCase.res}`, () => {
      setupMockIsMatchingLocation(testCase.loc);
      setupMockOnboardingStatus(testCase.status);
      expect(usePageChangeEffectNavigateLocation()).toEqual(testCase.res);
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
