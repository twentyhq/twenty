import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { AppPath } from '@/types/AppPath';
import { OnboardingStatus } from '~/generated/graphql';
import { useDefaultHomePagePath } from '~/hooks/useDefaultHomePagePath';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';
import { usePageChangeEffectNavigateLocation } from '~/hooks/usePageChangeEffectNavigateLocation';

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

const defaultHomePagePath = '/objects/companies';

jest.mock('~/hooks/useDefaultHomePagePath');
jest.mocked(useDefaultHomePagePath).mockReturnValue({
  defaultHomePagePath: '/objects/companies',
});

// prettier-ignore
const testCases = [
  { loc: AppPath.Verify, status: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.Verify, status: OnboardingStatus.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.Verify, status: OnboardingStatus.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.Verify, status: OnboardingStatus.SubscriptionPastDue, res: defaultHomePagePath },
  { loc: AppPath.Verify, status: undefined, res: undefined },
  { loc: AppPath.Verify, status: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.Verify, status: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.Verify, status: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.Verify, status: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.Verify, status: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.Verify, status: OnboardingStatus.CompletedWithoutSubscription, res: defaultHomePagePath },

  { loc: AppPath.SignInUp, status: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.SignInUp, status: OnboardingStatus.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.SignInUp, status: OnboardingStatus.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.SignInUp, status: OnboardingStatus.SubscriptionPastDue, res: defaultHomePagePath },
  { loc: AppPath.SignInUp, status: undefined, res: undefined },
  { loc: AppPath.SignInUp, status: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.SignInUp, status: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.SignInUp, status: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.SignInUp, status: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.SignInUp, status: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.SignInUp, status: OnboardingStatus.CompletedWithoutSubscription, res: defaultHomePagePath },

  { loc: AppPath.Invite, status: OnboardingStatus.PlanRequired, res: undefined },
  { loc: AppPath.Invite, status: OnboardingStatus.SubscriptionCanceled, res: undefined },
  { loc: AppPath.Invite, status: OnboardingStatus.SubscriptionUnpaid, res: undefined },
  { loc: AppPath.Invite, status: OnboardingStatus.SubscriptionPastDue, res: undefined },
  { loc: AppPath.Invite, status: undefined, res: undefined },
  { loc: AppPath.Invite, status: OnboardingStatus.WorkspaceActivation, res: undefined },
  { loc: AppPath.Invite, status: OnboardingStatus.ProfileCreation, res: undefined },
  { loc: AppPath.Invite, status: OnboardingStatus.SyncEmail, res: undefined },
  { loc: AppPath.Invite, status: OnboardingStatus.InviteTeam, res: undefined },
  { loc: AppPath.Invite, status: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.Invite, status: OnboardingStatus.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.ResetPassword, status: OnboardingStatus.PlanRequired, res: undefined },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.SubscriptionCanceled, res: undefined },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.SubscriptionUnpaid, res: undefined },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.SubscriptionPastDue, res: undefined },
  { loc: AppPath.ResetPassword, status: undefined, res: undefined },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.WorkspaceActivation, res: undefined },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.ProfileCreation, res: undefined },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.SyncEmail, res: undefined },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.InviteTeam, res: undefined },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.SubscriptionPastDue, res: defaultHomePagePath },
  { loc: AppPath.CreateWorkspace, status: undefined, res: AppPath.SignInUp },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.WorkspaceActivation, res: undefined },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.CompletedWithoutSubscription, res: defaultHomePagePath },

  { loc: AppPath.CreateProfile, status: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.SubscriptionPastDue, res: defaultHomePagePath },
  { loc: AppPath.CreateProfile, status: undefined, res: AppPath.SignInUp },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.ProfileCreation, res: undefined },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.CompletedWithoutSubscription, res: defaultHomePagePath },

  { loc: AppPath.SyncEmails, status: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.SyncEmails, status: OnboardingStatus.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.SyncEmails, status: OnboardingStatus.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.SyncEmails, status: OnboardingStatus.SubscriptionPastDue, res: defaultHomePagePath },
  { loc: AppPath.SyncEmails, status: undefined, res: AppPath.SignInUp },
  { loc: AppPath.SyncEmails, status: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.SyncEmails, status: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.SyncEmails, status: OnboardingStatus.SyncEmail, res: undefined },
  { loc: AppPath.SyncEmails, status: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.SyncEmails, status: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.SyncEmails, status: OnboardingStatus.CompletedWithoutSubscription, res: defaultHomePagePath },

  { loc: AppPath.InviteTeam, status: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.InviteTeam, status: OnboardingStatus.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.InviteTeam, status: OnboardingStatus.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.InviteTeam, status: OnboardingStatus.SubscriptionPastDue, res: defaultHomePagePath },
  { loc: AppPath.InviteTeam, status: undefined, res: AppPath.SignInUp },
  { loc: AppPath.InviteTeam, status: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.InviteTeam, status: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.InviteTeam, status: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.InviteTeam, status: OnboardingStatus.InviteTeam, res: undefined },
  { loc: AppPath.InviteTeam, status: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.InviteTeam, status: OnboardingStatus.CompletedWithoutSubscription, res: defaultHomePagePath },

  { loc: AppPath.PlanRequired, status: OnboardingStatus.PlanRequired, res: undefined },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.SubscriptionCanceled, res: undefined },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.SubscriptionPastDue, res: defaultHomePagePath },
  { loc: AppPath.PlanRequired, status: undefined, res: AppPath.SignInUp },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.SubscriptionPastDue, res: defaultHomePagePath },
  { loc: AppPath.PlanRequiredSuccess, status: undefined, res: AppPath.SignInUp },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.WorkspaceActivation, res: undefined },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.CompletedWithoutSubscription, res: defaultHomePagePath },

  { loc: AppPath.Index, status: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.Index, status: OnboardingStatus.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.Index, status: OnboardingStatus.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.Index, status: OnboardingStatus.SubscriptionPastDue, res: defaultHomePagePath },
  { loc: AppPath.Index, status: undefined, res: AppPath.SignInUp },
  { loc: AppPath.Index, status: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.Index, status: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.Index, status: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.Index, status: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.Index, status: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.Index, status: OnboardingStatus.CompletedWithoutSubscription, res: defaultHomePagePath },

  { loc: AppPath.TasksPage, status: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.TasksPage, status: OnboardingStatus.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.TasksPage, status: OnboardingStatus.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.TasksPage, status: OnboardingStatus.SubscriptionPastDue, res: undefined },
  { loc: AppPath.TasksPage, status: undefined, res: AppPath.SignInUp },
  { loc: AppPath.TasksPage, status: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.TasksPage, status: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.TasksPage, status: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.TasksPage, status: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.TasksPage, status: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.TasksPage, status: OnboardingStatus.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.SubscriptionPastDue, res: undefined },
  { loc: AppPath.OpportunitiesPage, status: undefined, res: AppPath.SignInUp },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.SubscriptionPastDue, res: undefined },
  { loc: AppPath.RecordIndexPage, status: undefined, res: AppPath.SignInUp },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.RecordShowPage, status: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.SubscriptionPastDue, res: undefined },
  { loc: AppPath.RecordShowPage, status: undefined, res: AppPath.SignInUp },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.SubscriptionCanceled, res: undefined },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.SubscriptionUnpaid, res: undefined },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.SubscriptionPastDue, res: undefined },
  { loc: AppPath.SettingsCatchAll, status: undefined, res: AppPath.SignInUp },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.SubscriptionPastDue, res: undefined },
  { loc: AppPath.DevelopersCatchAll, status: undefined, res: AppPath.SignInUp },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.Impersonate, status: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.Impersonate, status: OnboardingStatus.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.Impersonate, status: OnboardingStatus.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.Impersonate, status: OnboardingStatus.SubscriptionPastDue, res: undefined },
  { loc: AppPath.Impersonate, status: undefined, res: AppPath.SignInUp },
  { loc: AppPath.Impersonate, status: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.Impersonate, status: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.Impersonate, status: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.Impersonate, status: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.Impersonate, status: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.Impersonate, status: OnboardingStatus.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.Authorize, status: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.Authorize, status: OnboardingStatus.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.Authorize, status: OnboardingStatus.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.Authorize, status: OnboardingStatus.SubscriptionPastDue, res: undefined },
  { loc: AppPath.Authorize, status: undefined, res: AppPath.SignInUp },
  { loc: AppPath.Authorize, status: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.Authorize, status: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.Authorize, status: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.Authorize, status: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.Authorize, status: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.Authorize, status: OnboardingStatus.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.SubscriptionPastDue, res: undefined },
  { loc: AppPath.NotFoundWildcard, status: undefined, res: AppPath.SignInUp },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.NotFound, status: OnboardingStatus.PlanRequired, res: AppPath.PlanRequired },
  { loc: AppPath.NotFound, status: OnboardingStatus.SubscriptionCanceled, res: '/settings/billing' },
  { loc: AppPath.NotFound, status: OnboardingStatus.SubscriptionUnpaid, res: '/settings/billing' },
  { loc: AppPath.NotFound, status: OnboardingStatus.SubscriptionPastDue, res: undefined },
  { loc: AppPath.NotFound, status: undefined, res: AppPath.SignInUp },
  { loc: AppPath.NotFound, status: OnboardingStatus.WorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.NotFound, status: OnboardingStatus.ProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.NotFound, status: OnboardingStatus.SyncEmail, res: AppPath.SyncEmails },
  { loc: AppPath.NotFound, status: OnboardingStatus.InviteTeam, res: AppPath.InviteTeam },
  { loc: AppPath.NotFound, status: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.NotFound, status: OnboardingStatus.CompletedWithoutSubscription, res: undefined },
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
        Object.keys(AppPath).length *
          (Object.keys(OnboardingStatus).length + 1),
      );
    });
  });
});
