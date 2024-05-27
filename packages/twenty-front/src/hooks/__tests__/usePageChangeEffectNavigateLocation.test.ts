import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { OnboardingStatus } from '@/auth/utils/getOnboardingStatus';
import { AppPath } from '@/types/AppPath';
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
  { loc: AppPath.Verify, status: OnboardingStatus.Incomplete, res: AppPath.PlanRequired },
  { loc: AppPath.Verify, status: OnboardingStatus.Canceled, res: '/settings/billing' },
  { loc: AppPath.Verify, status: OnboardingStatus.Unpaid, res: '/settings/billing' },
  { loc: AppPath.Verify, status: OnboardingStatus.PastDue, res: undefined },
  { loc: AppPath.Verify, status: OnboardingStatus.OngoingUserCreation, res: undefined },
  { loc: AppPath.Verify, status: OnboardingStatus.OngoingWorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.Verify, status: OnboardingStatus.OngoingProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.Verify, status: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.Verify, status: OnboardingStatus.CompletedWithoutSubscription, res: defaultHomePagePath },

  { loc: AppPath.SignInUp, status: OnboardingStatus.Incomplete, res: AppPath.PlanRequired },
  { loc: AppPath.SignInUp, status: OnboardingStatus.Canceled, res: '/settings/billing' },
  { loc: AppPath.SignInUp, status: OnboardingStatus.Unpaid, res: '/settings/billing' },
  { loc: AppPath.SignInUp, status: OnboardingStatus.PastDue, res: undefined },
  { loc: AppPath.SignInUp, status: OnboardingStatus.OngoingUserCreation, res: undefined },
  { loc: AppPath.SignInUp, status: OnboardingStatus.OngoingWorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.SignInUp, status: OnboardingStatus.OngoingProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.SignInUp, status: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.SignInUp, status: OnboardingStatus.CompletedWithoutSubscription, res: defaultHomePagePath },

  { loc: AppPath.Invite, status: OnboardingStatus.Incomplete, res: AppPath.PlanRequired },
  { loc: AppPath.Invite, status: OnboardingStatus.Canceled, res: '/settings/billing' },
  { loc: AppPath.Invite, status: OnboardingStatus.Unpaid, res: '/settings/billing' },
  { loc: AppPath.Invite, status: OnboardingStatus.PastDue, res: undefined },
  { loc: AppPath.Invite, status: OnboardingStatus.OngoingUserCreation, res: undefined },
  { loc: AppPath.Invite, status: OnboardingStatus.OngoingWorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.Invite, status: OnboardingStatus.OngoingProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.Invite, status: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.Invite, status: OnboardingStatus.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.ResetPassword, status: OnboardingStatus.Incomplete, res: AppPath.PlanRequired },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.Canceled, res: '/settings/billing' },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.Unpaid, res: '/settings/billing' },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.PastDue, res: undefined },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.OngoingUserCreation, res: undefined },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.OngoingWorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.OngoingProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.ResetPassword, status: OnboardingStatus.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.Incomplete, res: AppPath.PlanRequired },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.Canceled, res: '/settings/billing' },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.Unpaid, res: '/settings/billing' },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.PastDue, res: undefined },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.OngoingUserCreation, res: AppPath.SignInUp },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.OngoingWorkspaceActivation, res: undefined },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.OngoingProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.CreateWorkspace, status: OnboardingStatus.CompletedWithoutSubscription, res: defaultHomePagePath },

  { loc: AppPath.CreateProfile, status: OnboardingStatus.Incomplete, res: AppPath.PlanRequired },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.Canceled, res: '/settings/billing' },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.Unpaid, res: '/settings/billing' },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.PastDue, res: undefined },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.OngoingUserCreation, res: AppPath.SignInUp },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.OngoingWorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.OngoingProfileCreation, res: undefined },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.CreateProfile, status: OnboardingStatus.CompletedWithoutSubscription, res: defaultHomePagePath },

  { loc: AppPath.PlanRequired, status: OnboardingStatus.Incomplete, res: undefined },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.Canceled, res: undefined },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.Unpaid, res: undefined },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.PastDue, res: undefined },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.OngoingUserCreation, res: AppPath.SignInUp },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.OngoingWorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.OngoingProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.PlanRequired, status: OnboardingStatus.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.Incomplete, res: AppPath.PlanRequired },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.Canceled, res: '/settings/billing' },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.Unpaid, res: '/settings/billing' },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.PastDue, res: undefined },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.OngoingUserCreation, res: AppPath.SignInUp },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.OngoingWorkspaceActivation, res: undefined },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.OngoingProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.PlanRequiredSuccess, status: OnboardingStatus.CompletedWithoutSubscription, res: defaultHomePagePath },

  { loc: AppPath.Index, status: OnboardingStatus.Incomplete, res: AppPath.PlanRequired },
  { loc: AppPath.Index, status: OnboardingStatus.Canceled, res: '/settings/billing' },
  { loc: AppPath.Index, status: OnboardingStatus.Unpaid, res: '/settings/billing' },
  { loc: AppPath.Index, status: OnboardingStatus.PastDue, res: defaultHomePagePath },
  { loc: AppPath.Index, status: OnboardingStatus.OngoingUserCreation, res: AppPath.SignInUp },
  { loc: AppPath.Index, status: OnboardingStatus.OngoingWorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.Index, status: OnboardingStatus.OngoingProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.Index, status: OnboardingStatus.Completed, res: defaultHomePagePath },
  { loc: AppPath.Index, status: OnboardingStatus.CompletedWithoutSubscription, res: defaultHomePagePath },

  { loc: AppPath.TasksPage, status: OnboardingStatus.Incomplete, res: AppPath.PlanRequired },
  { loc: AppPath.TasksPage, status: OnboardingStatus.Canceled, res: '/settings/billing' },
  { loc: AppPath.TasksPage, status: OnboardingStatus.Unpaid, res: '/settings/billing' },
  { loc: AppPath.TasksPage, status: OnboardingStatus.PastDue, res: undefined },
  { loc: AppPath.TasksPage, status: OnboardingStatus.OngoingUserCreation, res: AppPath.SignInUp },
  { loc: AppPath.TasksPage, status: OnboardingStatus.OngoingWorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.TasksPage, status: OnboardingStatus.OngoingProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.TasksPage, status: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.TasksPage, status: OnboardingStatus.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.Incomplete, res: AppPath.PlanRequired },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.Canceled, res: '/settings/billing' },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.Unpaid, res: '/settings/billing' },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.PastDue, res: undefined },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.OngoingUserCreation, res: AppPath.SignInUp },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.OngoingWorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.OngoingProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.OpportunitiesPage, status: OnboardingStatus.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.Incomplete, res: AppPath.PlanRequired },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.Canceled, res: '/settings/billing' },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.Unpaid, res: '/settings/billing' },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.PastDue, res: undefined },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.OngoingUserCreation, res: AppPath.SignInUp },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.OngoingWorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.OngoingProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.RecordIndexPage, status: OnboardingStatus.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.RecordShowPage, status: OnboardingStatus.Incomplete, res: AppPath.PlanRequired },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.Canceled, res: '/settings/billing' },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.Unpaid, res: '/settings/billing' },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.PastDue, res: undefined },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.OngoingUserCreation, res: AppPath.SignInUp },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.OngoingWorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.OngoingProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.RecordShowPage, status: OnboardingStatus.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.Incomplete, res: AppPath.PlanRequired },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.Canceled, res: undefined },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.Unpaid, res: undefined },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.PastDue, res: undefined },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.OngoingUserCreation, res: AppPath.SignInUp },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.OngoingWorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.OngoingProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.SettingsCatchAll, status: OnboardingStatus.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.Incomplete, res: AppPath.PlanRequired },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.Canceled, res: '/settings/billing' },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.Unpaid, res: '/settings/billing' },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.PastDue, res: undefined },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.OngoingUserCreation, res: AppPath.SignInUp },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.OngoingWorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.OngoingProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.DevelopersCatchAll, status: OnboardingStatus.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.Impersonate, status: OnboardingStatus.Incomplete, res: AppPath.PlanRequired },
  { loc: AppPath.Impersonate, status: OnboardingStatus.Canceled, res: '/settings/billing' },
  { loc: AppPath.Impersonate, status: OnboardingStatus.Unpaid, res: '/settings/billing' },
  { loc: AppPath.Impersonate, status: OnboardingStatus.PastDue, res: undefined },
  { loc: AppPath.Impersonate, status: OnboardingStatus.OngoingUserCreation, res: AppPath.SignInUp },
  { loc: AppPath.Impersonate, status: OnboardingStatus.OngoingWorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.Impersonate, status: OnboardingStatus.OngoingProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.Impersonate, status: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.Impersonate, status: OnboardingStatus.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.Authorize, status: OnboardingStatus.Incomplete, res: AppPath.PlanRequired },
  { loc: AppPath.Authorize, status: OnboardingStatus.Canceled, res: '/settings/billing' },
  { loc: AppPath.Authorize, status: OnboardingStatus.Unpaid, res: '/settings/billing' },
  { loc: AppPath.Authorize, status: OnboardingStatus.PastDue, res: undefined },
  { loc: AppPath.Authorize, status: OnboardingStatus.OngoingUserCreation, res: AppPath.SignInUp },
  { loc: AppPath.Authorize, status: OnboardingStatus.OngoingWorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.Authorize, status: OnboardingStatus.OngoingProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.Authorize, status: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.Authorize, status: OnboardingStatus.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.Incomplete, res: AppPath.PlanRequired },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.Canceled, res: '/settings/billing' },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.Unpaid, res: '/settings/billing' },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.PastDue, res: undefined },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.OngoingUserCreation, res: AppPath.SignInUp },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.OngoingWorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.OngoingProfileCreation, res: AppPath.CreateProfile },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.Completed, res: undefined },
  { loc: AppPath.NotFoundWildcard, status: OnboardingStatus.CompletedWithoutSubscription, res: undefined },

  { loc: AppPath.NotFound, status: OnboardingStatus.Incomplete, res: AppPath.PlanRequired },
  { loc: AppPath.NotFound, status: OnboardingStatus.Canceled, res: '/settings/billing' },
  { loc: AppPath.NotFound, status: OnboardingStatus.Unpaid, res: '/settings/billing' },
  { loc: AppPath.NotFound, status: OnboardingStatus.PastDue, res: undefined },
  { loc: AppPath.NotFound, status: OnboardingStatus.OngoingUserCreation, res: AppPath.SignInUp },
  { loc: AppPath.NotFound, status: OnboardingStatus.OngoingWorkspaceActivation, res: AppPath.CreateWorkspace },
  { loc: AppPath.NotFound, status: OnboardingStatus.OngoingProfileCreation, res: AppPath.CreateProfile },
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
        Object.keys(AppPath).length * Object.keys(OnboardingStatus).length,
      );
    });
  });
});
