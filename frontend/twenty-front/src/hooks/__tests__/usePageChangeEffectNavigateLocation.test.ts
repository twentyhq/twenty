import { useHasAccessTokenPair } from '@/auth/hooks/useHasAccessTokenPair';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import { useParams } from 'react-router-dom';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { OnboardingStatus } from '~/generated-metadata/graphql';

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

jest.mock('@/auth/hooks/useHasAccessTokenPair');
const setupMockHasAccessTokenPair = (hasAccessTokenPair: boolean) => {
  jest.mocked(useHasAccessTokenPair).mockReturnValueOnce(hasAccessTokenPair);
};

const defaultHomePagePath = '/objects/companies';

jest.mock('@/navigation/hooks/useDefaultHomePagePath');
jest.mocked(useDefaultHomePagePath).mockReturnValue({
  defaultHomePagePath,
});

jest.mock('@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace');
const setupMockIsOnAWorkspace = (isOnAWorkspace: boolean) => {
  jest.mocked(useIsCurrentLocationOnAWorkspace).mockReturnValue({
    isOnAWorkspace,
  });
};

jest.mock('react-router-dom');
const setupMockUseParams = (objectNamePlural?: string) => {
  jest
    .mocked(useParams)
    .mockReturnValueOnce({ objectNamePlural: objectNamePlural ?? '' });
};

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue');
const setupMockState = (
  objectNamePlural?: string,
  verifyEmailRedirectPath?: string,
  calendarBookingPageId?: string | null,
  returnToPath?: string,
) => {
  jest
    .mocked(useAtomStateValue)
    .mockReturnValueOnce(calendarBookingPageId ?? 'mock-calendar-id')
    .mockReturnValueOnce([{ namePlural: objectNamePlural ?? '' }])
    .mockReturnValueOnce(verifyEmailRedirectPath)
    .mockReturnValueOnce(returnToPath ?? '');
};

// prettier-ignore
const testCases: {
  loc: AppPath;
  hasAccessTokenPair: boolean;
  isWorkspaceSuspended: boolean;
  onboardingStatus: OnboardingStatus | undefined;
  res: string | undefined;
  isOnAWorkspace?: boolean;
  objectNamePluralFromParams?: string;
  objectNamePluralFromMetadata?: string;
  verifyEmailRedirectPath?: string;
  returnToPath?: string;
}[] = [
  { loc: AppPath.Verify, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.Verify, hasAccessTokenPair: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.Verify, hasAccessTokenPair: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: undefined },
  { loc: AppPath.Verify, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.Verify, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.Verify, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.Verify, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.Verify, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.Verify, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.SignInUp, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.SignInUp, hasAccessTokenPair: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.SignInUp, hasAccessTokenPair: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: undefined },
  { loc: AppPath.SignInUp, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.SignInUp, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.SignInUp, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.SignInUp, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.SignInUp, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.SignInUp, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.Invite, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: '/plan-required' },
  { loc: AppPath.Invite, hasAccessTokenPair: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.Invite, hasAccessTokenPair: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: undefined },
  { loc: AppPath.Invite, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: '/create/workspace' },
  { loc: AppPath.Invite, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: '/create/profile' },
  { loc: AppPath.Invite, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: '/sync/emails' },
  { loc: AppPath.Invite, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: '/invite-team' },
  { loc: AppPath.Invite, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.Invite, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.ResetPassword, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: '/plan-required' },
  { loc: AppPath.ResetPassword, hasAccessTokenPair: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.ResetPassword, hasAccessTokenPair: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: undefined },
  { loc: AppPath.ResetPassword, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: '/create/workspace' },
  { loc: AppPath.ResetPassword, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: '/create/profile' },
  { loc: AppPath.ResetPassword, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: '/sync/emails' },
  { loc: AppPath.ResetPassword, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: '/invite-team' },
  { loc: AppPath.ResetPassword, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.ResetPassword, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.VerifyEmail, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.VerifyEmail, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, verifyEmailRedirectPath: '/nextPath?key=value', res: '/nextPath?key=value' },
  { loc: AppPath.VerifyEmail, hasAccessTokenPair: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.VerifyEmail, hasAccessTokenPair: false, isWorkspaceSuspended: false, onboardingStatus: undefined, verifyEmailRedirectPath: '/nextPath?key=value', res: undefined },
  { loc: AppPath.VerifyEmail, hasAccessTokenPair: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: undefined },
  { loc: AppPath.VerifyEmail, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.VerifyEmail, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.VerifyEmail, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.VerifyEmail, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.VerifyEmail, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.VerifyEmail, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.CreateWorkspace, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.CreateWorkspace, hasAccessTokenPair: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.CreateWorkspace, hasAccessTokenPair: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.CreateWorkspace, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: undefined },
  { loc: AppPath.CreateWorkspace, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.CreateWorkspace, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.CreateWorkspace, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.CreateWorkspace, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.CreateWorkspace, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.CreateProfile, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.CreateProfile, hasAccessTokenPair: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.CreateProfile, hasAccessTokenPair: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.CreateProfile, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.CreateProfile, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: undefined },
  { loc: AppPath.CreateProfile, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.CreateProfile, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.CreateProfile, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.CreateProfile, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.SyncEmails, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.SyncEmails, hasAccessTokenPair: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.SyncEmails, hasAccessTokenPair: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.SyncEmails, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.SyncEmails, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.SyncEmails, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: undefined },
  { loc: AppPath.SyncEmails, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.SyncEmails, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.SyncEmails, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.InviteTeam, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.InviteTeam, hasAccessTokenPair: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.InviteTeam, hasAccessTokenPair: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.InviteTeam, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.InviteTeam, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.InviteTeam, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.InviteTeam, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: undefined },
  { loc: AppPath.InviteTeam, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.InviteTeam, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.BookCallDecision, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: undefined },
  { loc: AppPath.BookCallDecision, hasAccessTokenPair: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.BookCallDecision, hasAccessTokenPair: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.BookCallDecision, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: undefined },
  { loc: AppPath.BookCallDecision, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.BookCallDecision, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.BookCallDecision, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.BookCallDecision, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: undefined },
  { loc: AppPath.BookCallDecision, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.BookCall, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: undefined },
  { loc: AppPath.BookCall, hasAccessTokenPair: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.BookCall, hasAccessTokenPair: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.BookCall, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: undefined },
  { loc: AppPath.BookCall, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.BookCall, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.BookCall, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.BookCall, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: undefined },
  { loc: AppPath.BookCall, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.PlanRequired, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: undefined },
  { loc: AppPath.PlanRequired, hasAccessTokenPair: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.PlanRequired, hasAccessTokenPair: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.PlanRequired, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.PlanRequired, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.PlanRequired, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.PlanRequired, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.PlanRequired, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.PlanRequired, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.PlanRequiredSuccess, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: undefined },
  { loc: AppPath.PlanRequiredSuccess, hasAccessTokenPair: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.PlanRequiredSuccess, hasAccessTokenPair: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.PlanRequiredSuccess, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.PlanRequiredSuccess, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.PlanRequiredSuccess, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.PlanRequiredSuccess, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.PlanRequiredSuccess, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.PlanRequiredSuccess, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.Index, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.Index, hasAccessTokenPair: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.Index, hasAccessTokenPair: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.Index, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.Index, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.Index, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.Index, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.Index, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.Index, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.TasksPage, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.TasksPage, hasAccessTokenPair: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.TasksPage, hasAccessTokenPair: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.TasksPage, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.TasksPage, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.TasksPage, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.TasksPage, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.TasksPage, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.TasksPage, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.OpportunitiesPage, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.OpportunitiesPage, hasAccessTokenPair: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.OpportunitiesPage, hasAccessTokenPair: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.OpportunitiesPage, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.OpportunitiesPage, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.OpportunitiesPage, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.OpportunitiesPage, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.OpportunitiesPage, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.OpportunitiesPage, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.RecordIndexPage, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.RecordIndexPage, hasAccessTokenPair: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.RecordIndexPage, hasAccessTokenPair: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.RecordIndexPage, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.RecordIndexPage, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.RecordIndexPage, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.RecordIndexPage, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.RecordIndexPage, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.RecordIndexPage, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },
  { loc: AppPath.RecordIndexPage, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined, objectNamePluralFromParams: 'existing-object', objectNamePluralFromMetadata: 'existing-object' },
  { loc: AppPath.RecordIndexPage, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: AppPath.NotFound, objectNamePluralFromParams: 'non-existing-object', objectNamePluralFromMetadata: 'existing-object' },

  { loc: AppPath.RecordShowPage, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.RecordShowPage, hasAccessTokenPair: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.RecordShowPage, hasAccessTokenPair: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.RecordShowPage, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.RecordShowPage, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.RecordShowPage, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.RecordShowPage, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.RecordShowPage, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.RecordShowPage, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.SettingsCatchAll, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.SettingsCatchAll, hasAccessTokenPair: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },
  { loc: AppPath.SettingsCatchAll, hasAccessTokenPair: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.SettingsCatchAll, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.SettingsCatchAll, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.SettingsCatchAll, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.SettingsCatchAll, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.SettingsCatchAll, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.SettingsCatchAll, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.DevelopersCatchAll, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.DevelopersCatchAll, hasAccessTokenPair: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.DevelopersCatchAll, hasAccessTokenPair: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.DevelopersCatchAll, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.DevelopersCatchAll, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.DevelopersCatchAll, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.DevelopersCatchAll, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.DevelopersCatchAll, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.DevelopersCatchAll, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.Authorize, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.Authorize, hasAccessTokenPair: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.Authorize, hasAccessTokenPair: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.Authorize, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.Authorize, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.Authorize, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.Authorize, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.Authorize, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.Authorize, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.NotFoundWildcard, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.NotFoundWildcard, hasAccessTokenPair: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.NotFoundWildcard, hasAccessTokenPair: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.NotFoundWildcard, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.NotFoundWildcard, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.NotFoundWildcard, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.NotFoundWildcard, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.NotFoundWildcard, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.NotFoundWildcard, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.NotFound, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.NotFound, hasAccessTokenPair: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.NotFound, hasAccessTokenPair: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.NotFound, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.NotFound, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.NotFound, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.NotFound, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.NotFound, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_ONBOARDING, res: AppPath.BookCallDecision },
  { loc: AppPath.NotFound, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  // returnToPath: should redirect to saved path instead of defaultHomePagePath
  { loc: AppPath.Verify, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, returnToPath: '/authorize?clientId=abc', res: '/authorize?clientId=abc' },
  { loc: AppPath.SignInUp, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, returnToPath: '/objects/tasks', res: '/objects/tasks' },
  { loc: AppPath.Index, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, returnToPath: '/settings/api-keys', res: '/settings/api-keys' },

  // isOnAWorkspace:false — on default domain, don't redirect to returnToPath or defaultHomePagePath from auth pages
  { loc: AppPath.Verify, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, isOnAWorkspace: false, res: undefined },
  { loc: AppPath.SignInUp, hasAccessTokenPair: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, isOnAWorkspace: false, res: undefined },
];

describe('usePageChangeEffectNavigateLocation', () => {
  it.each(testCases)(
    'with location $loc and onboardingStatus $onboardingStatus and isWorkspaceSuspended $isWorkspaceSuspended should return $res`',
    ({
      loc,
      onboardingStatus,
      isWorkspaceSuspended,
      hasAccessTokenPair,
      isOnAWorkspace,
      objectNamePluralFromParams,
      objectNamePluralFromMetadata,
      verifyEmailRedirectPath,
      returnToPath,
      res,
    }) => {
      setupMockIsMatchingLocation(loc);
      setupMockOnboardingStatus(onboardingStatus);
      setupMockIsWorkspaceActivationStatusEqualsTo(isWorkspaceSuspended);
      setupMockHasAccessTokenPair(hasAccessTokenPair);
      setupMockIsOnAWorkspace(isOnAWorkspace ?? true);
      setupMockUseParams(objectNamePluralFromParams);
      setupMockState(
        objectNamePluralFromMetadata,
        verifyEmailRedirectPath,
        undefined,
        returnToPath,
      );

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
            .length +
          ['returnToPath:verify', 'returnToPath:signInUp', 'returnToPath:index']
            .length +
          ['notOnWorkspace:verify', 'notOnWorkspace:signInUp'].length,
      );
    });
  });
});
