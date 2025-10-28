import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { OnboardingStatus } from '~/generated/graphql';

import { useIsCurrentLocationOnAWorkspace } from '@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace';
import { usePageChangeEffectNavigateLocation } from '~/hooks/usePageChangeEffectNavigateLocation';
import { UNTESTED_APP_PATHS } from '~/testing/constants/UntestedAppPaths';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

jest.mock('@/onboarding/hooks/useOnboardingStatus');
const setupMockOnboardingStatus = (
  onboardingStatus: OnboardingStatus | undefined,
) => {
  jest.mocked(useOnboardingStatus).mockReturnValueOnce(onboardingStatus);
};

jest.mock('@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo');
const setupMockIsWorkspaceActivationStatusEqualsTo = (
  isWorkspaceSuspended: boolean,
) => {
  jest
    .mocked(useIsWorkspaceActivationStatusEqualsTo)
    .mockReturnValueOnce(isWorkspaceSuspended);
};

jest.mock('~/utils/isMatchingLocation');
const mockIsMatchingLocation = jest.mocked(isMatchingLocation);

const setupMockIsMatchingLocation = (pathname: string) => {
  mockIsMatchingLocation.mockImplementation(
    (_location, path) => path === pathname,
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

jest.mock('@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace');
jest.mocked(useIsCurrentLocationOnAWorkspace).mockReturnValue({
  isOnAWorkspace: true,
});

jest.mock('react-router-dom');
const setupMockUseParams = (objectNamePlural?: string) => {
  jest
    .mocked(useParams)
    .mockReturnValueOnce({ objectNamePlural: objectNamePlural ?? '' });
};

jest.mock('recoil');
const setupMockRecoil = (
  objectNamePlural?: string,
  verifyEmailRedirectPath?: string,
  calendarBookingPageId?: string | null,
) => {
  jest
    .mocked(useRecoilValue)
    .mockReturnValueOnce(calendarBookingPageId ?? 'mock-calendar-id')
    .mockReturnValueOnce([{ namePlural: objectNamePlural ?? '' }])
    .mockReturnValueOnce(verifyEmailRedirectPath);
};

// prettier-ignore
const testCases: {
  loc: AppPath;
  isLoggedIn: boolean;
  isWorkspaceSuspended: boolean;
  onboardingStatus: OnboardingStatus | undefined;
  res: string | undefined;
  objectNamePluralFromParams?: string;
  objectNamePluralFromMetadata?: string;
  verifyEmailRedirectPath?: string;
}[] = [
  { loc: AppPath.Verify, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.Verify, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.Verify, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: undefined },
  { loc: AppPath.Verify, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.Verify, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.Verify, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.Verify, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.Verify, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.Verify, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.SignInUp, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.SignInUp, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.SignInUp, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: undefined },
  { loc: AppPath.SignInUp, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.SignInUp, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.SignInUp, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.SignInUp, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.SignInUp, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.SignInUp, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.Invite, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: '/plan-required' },
  { loc: AppPath.Invite, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.Invite, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: undefined },
  { loc: AppPath.Invite, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: '/create/workspace' },
  { loc: AppPath.Invite, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: '/create/profile' },
  { loc: AppPath.Invite, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: '/sync/emails' },
  { loc: AppPath.Invite, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: '/invite-team' },
  { loc: AppPath.Invite, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.Invite, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.ResetPassword, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: '/plan-required' },
  { loc: AppPath.ResetPassword, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.ResetPassword, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: undefined },
  { loc: AppPath.ResetPassword, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: '/create/workspace' },
  { loc: AppPath.ResetPassword, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: '/create/profile' },
  { loc: AppPath.ResetPassword, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: '/sync/emails' },
  { loc: AppPath.ResetPassword, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: '/invite-team' },
  { loc: AppPath.ResetPassword, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.ResetPassword, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.VerifyEmail, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.VerifyEmail, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, verifyEmailRedirectPath: '/nextPath?key=value', res: '/nextPath?key=value' },
  { loc: AppPath.VerifyEmail, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.VerifyEmail, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, verifyEmailRedirectPath: '/nextPath?key=value', res: undefined },
  { loc: AppPath.VerifyEmail, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: undefined },
  { loc: AppPath.VerifyEmail, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.VerifyEmail, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.VerifyEmail, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.VerifyEmail, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.VerifyEmail, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.VerifyEmail, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.CreateWorkspace, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.CreateWorkspace, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.CreateWorkspace, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.CreateWorkspace, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: undefined },
  { loc: AppPath.CreateWorkspace, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.CreateWorkspace, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.CreateWorkspace, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.CreateWorkspace, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.CreateWorkspace, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.CreateProfile, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.CreateProfile, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.CreateProfile, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.CreateProfile, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.CreateProfile, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: undefined },
  { loc: AppPath.CreateProfile, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.CreateProfile, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.CreateProfile, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.CreateProfile, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.SyncEmails, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.SyncEmails, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.SyncEmails, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.SyncEmails, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.SyncEmails, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.SyncEmails, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: undefined },
  { loc: AppPath.SyncEmails, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.SyncEmails, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.SyncEmails, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.InviteTeam, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.InviteTeam, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.InviteTeam, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.InviteTeam, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.InviteTeam, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.InviteTeam, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.InviteTeam, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: undefined },
  { loc: AppPath.InviteTeam, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.InviteTeam, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.BookCallDecision, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: undefined },
  { loc: AppPath.BookCallDecision, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.BookCallDecision, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.BookCallDecision, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: undefined },
  { loc: AppPath.BookCallDecision, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.BookCallDecision, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.BookCallDecision, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.BookCallDecision, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: undefined },
  { loc: AppPath.BookCallDecision, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.BookCall, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: undefined },
  { loc: AppPath.BookCall, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.BookCall, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.BookCall, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: undefined },
  { loc: AppPath.BookCall, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.BookCall, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.BookCall, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.BookCall, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: undefined },
  { loc: AppPath.BookCall, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.PlanRequired, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: undefined },
  { loc: AppPath.PlanRequired, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.PlanRequired, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.PlanRequired, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.PlanRequired, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.PlanRequired, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.PlanRequired, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.PlanRequired, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.PlanRequired, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.PlanRequiredSuccess, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: undefined },
  { loc: AppPath.PlanRequiredSuccess, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.PlanRequiredSuccess, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.PlanRequiredSuccess, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.PlanRequiredSuccess, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.PlanRequiredSuccess, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.PlanRequiredSuccess, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.PlanRequiredSuccess, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.PlanRequiredSuccess, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.Index, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.Index, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.Index, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.Index, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.Index, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.Index, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.Index, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.Index, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.Index, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.TasksPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.TasksPage, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.TasksPage, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.TasksPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.TasksPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.TasksPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.TasksPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.TasksPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.TasksPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.OpportunitiesPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.OpportunitiesPage, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.OpportunitiesPage, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.OpportunitiesPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.OpportunitiesPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.OpportunitiesPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.OpportunitiesPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.OpportunitiesPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.OpportunitiesPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.RecordIndexPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.RecordIndexPage, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.RecordIndexPage, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.RecordIndexPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.RecordIndexPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.RecordIndexPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.RecordIndexPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.RecordIndexPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.RecordIndexPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },
  { loc: AppPath.RecordIndexPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined, objectNamePluralFromParams: 'existing-object', objectNamePluralFromMetadata: 'existing-object' },
  { loc: AppPath.RecordIndexPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: AppPath.NotFound, objectNamePluralFromParams: 'non-existing-object', objectNamePluralFromMetadata: 'existing-object' },

  { loc: AppPath.RecordShowPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.RecordShowPage, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.RecordShowPage, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.RecordShowPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.RecordShowPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.RecordShowPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.RecordShowPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.RecordShowPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.RecordShowPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.SettingsCatchAll, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.SettingsCatchAll, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },
  { loc: AppPath.SettingsCatchAll, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.SettingsCatchAll, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.SettingsCatchAll, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.SettingsCatchAll, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.SettingsCatchAll, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.SettingsCatchAll, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.SettingsCatchAll, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.DevelopersCatchAll, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.DevelopersCatchAll, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.DevelopersCatchAll, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.DevelopersCatchAll, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.DevelopersCatchAll, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.DevelopersCatchAll, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.DevelopersCatchAll, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.DevelopersCatchAll, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.DevelopersCatchAll, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.Authorize, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.Authorize, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.Authorize, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.Authorize, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.Authorize, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.Authorize, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.Authorize, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.Authorize, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.Authorize, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.NotFoundWildcard, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.NotFoundWildcard, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.NotFoundWildcard, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.NotFoundWildcard, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.NotFoundWildcard, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.NotFoundWildcard, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.NotFoundWildcard, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.NotFoundWildcard, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.NotFoundWildcard, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.NotFound, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.NotFound, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.NotFound, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.NotFound, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.NotFound, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.NotFound, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.NotFound, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.NotFound, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.NotFound, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },
];

describe('usePageChangeEffectNavigateLocation', () => {
  it.each(testCases)(
    'with location $loc and onboardingStatus $onboardingStatus and isWorkspaceSuspended $isWorkspaceSuspended should return $res`',
    ({
      loc,
      onboardingStatus,
      isWorkspaceSuspended,
      isLoggedIn,
      objectNamePluralFromParams,
      objectNamePluralFromMetadata,
      verifyEmailRedirectPath,
      res,
    }) => {
      setupMockIsMatchingLocation(loc);
      setupMockOnboardingStatus(onboardingStatus);
      setupMockIsWorkspaceActivationStatusEqualsTo(isWorkspaceSuspended);
      setupMockIsLogged(isLoggedIn);
      setupMockUseParams(objectNamePluralFromParams);
      setupMockRecoil(objectNamePluralFromMetadata, verifyEmailRedirectPath);

      expect(usePageChangeEffectNavigateLocation()).toEqual(res);
    },
  );

  describe('tests should be exhaustive', () => {
    it('all location, onboarding status and suspended/not suspended workspace activation status should be tested', () => {
      expect(testCases.length).toEqual(
        (Object.keys(AppPath).length - UNTESTED_APP_PATHS.length) *
          (Object.keys(OnboardingStatus).length +
            ['isWorkspaceSuspended:true', 'isWorkspaceSuspended:false']
              .length) +
          ['nonExistingObjectInParam', 'existingObjectInParam:false'].length +
          ['caseWithRedirectionToVerifyEmailRedirectPath', 'caseWithout']
            .length,
      );
    });
  });
});
