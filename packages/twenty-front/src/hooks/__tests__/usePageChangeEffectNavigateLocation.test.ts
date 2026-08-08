import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import { useQuery } from '@apollo/client/react';
import { useParams } from 'react-router-dom';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { OnboardingStatus, PageLayoutType } from '~/generated-metadata/graphql';

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
const setupMockIsOnAWorkspace = (isOnAWorkspace: boolean) => {
  jest.mocked(useIsCurrentLocationOnAWorkspace).mockReturnValue({
    isOnAWorkspace,
  });
};

jest.mock('@apollo/client/react');
const setupMockUseQuery = (result?: { data?: unknown; loading?: boolean }) => {
  jest.mocked(useQuery).mockReturnValueOnce({
    data: result?.data ?? undefined,
    loading: result?.loading ?? false,
  } as ReturnType<typeof useQuery>);
};

jest.mock('react-router-dom');
const setupMockUseParams = (
  objectNamePlural?: string,
  pageLayoutId?: string,
) => {
  jest.mocked(useParams).mockReturnValueOnce({
    objectNamePlural: objectNamePlural ?? '',
    pageLayoutId,
  });
};

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue');
const setupMockState = (
  objectNamePlural?: string,
  verifyEmailRedirectPath?: string,
  returnToPath?: string,
  currentWorkspace: object | null = { id: 'mock-workspace-id' },
  isBillingEnabled: boolean = true,
  isMinimalMetadataReady: boolean = true,
  shouldOpenAiChatAfterOnboarding: boolean = false,
  isOnboardingCheckoutPending: boolean = false,
) => {
  jest
    .mocked(useAtomStateValue)
    .mockReturnValueOnce(currentWorkspace)
    .mockReturnValueOnce({ isBillingEnabled })
    .mockReturnValueOnce([{ namePlural: objectNamePlural ?? '' }])
    .mockReturnValueOnce(isMinimalMetadataReady)
    .mockReturnValueOnce(verifyEmailRedirectPath)
    .mockReturnValueOnce(returnToPath ?? '')
    .mockReturnValueOnce(shouldOpenAiChatAfterOnboarding)
    .mockReturnValueOnce(isOnboardingCheckoutPending);
};

// prettier-ignore
const testCases: {
  loc: AppPath;
  isLogged: boolean;
  isWorkspaceSuspended: boolean;
  onboardingStatus: OnboardingStatus | undefined;
  res: string | undefined;
  isOnAWorkspace?: boolean;
  objectNamePluralFromParams?: string;
  objectNamePluralFromMetadata?: string;
  verifyEmailRedirectPath?: string;
  returnToPath?: string;
  pageLayoutId?: string;
  useQueryResult?: { data?: unknown; loading?: boolean };
  isBillingEnabled?: boolean;
  isMinimalMetadataReady?: boolean;
  shouldOpenAiChatAfterOnboarding?: boolean;
  isOnboardingCheckoutPending?: boolean;
}[] = [
  { loc: AppPath.WorkspaceSetup, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.WorkspaceSetup, isLogged: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.WorkspaceSetup, isLogged: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.WorkspaceSetup, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.WorkspaceActivation },
  { loc: AppPath.WorkspaceSetup, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.WorkspaceSetup, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.WorkspaceSetup, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.APPS_INSTALLATION, res: AppPath.InstallApps },
  { loc: AppPath.WorkspaceSetup, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.WorkspaceSetup, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_CALL, res: AppPath.BookCall },
  { loc: AppPath.WorkspaceSetup, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.Verify, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.Verify, isLogged: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.Verify, isLogged: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: undefined },
  { loc: AppPath.Verify, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.WorkspaceActivation },
  { loc: AppPath.Verify, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.Verify, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.Verify, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.APPS_INSTALLATION, res: AppPath.InstallApps },
  { loc: AppPath.Verify, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.Verify, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_CALL, res: AppPath.BookCall },
  { loc: AppPath.Verify, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.SignInUp, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.SignInUp, isLogged: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.SignInUp, isLogged: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: undefined },
  { loc: AppPath.SignInUp, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.WorkspaceActivation },
  { loc: AppPath.SignInUp, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.SignInUp, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.SignInUp, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.APPS_INSTALLATION, res: AppPath.InstallApps },
  { loc: AppPath.SignInUp, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.SignInUp, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_CALL, res: AppPath.BookCall },
  { loc: AppPath.SignInUp, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.Invite, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: '/plan-required' },
  { loc: AppPath.Invite, isLogged: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.Invite, isLogged: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: undefined },
  { loc: AppPath.Invite, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: '/workspace-activation' },
  { loc: AppPath.Invite, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: '/create/profile' },
  { loc: AppPath.Invite, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: '/sync/emails' },
  { loc: AppPath.Invite, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.APPS_INSTALLATION, res: AppPath.InstallApps },
  { loc: AppPath.Invite, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: '/invite-team' },
  { loc: AppPath.Invite, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_CALL, res: AppPath.BookCall },
  { loc: AppPath.Invite, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.ResetPassword, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: '/plan-required' },
  { loc: AppPath.ResetPassword, isLogged: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.ResetPassword, isLogged: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: undefined },
  { loc: AppPath.ResetPassword, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: '/workspace-activation' },
  { loc: AppPath.ResetPassword, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: '/create/profile' },
  { loc: AppPath.ResetPassword, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: '/sync/emails' },
  { loc: AppPath.ResetPassword, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.APPS_INSTALLATION, res: AppPath.InstallApps },
  { loc: AppPath.ResetPassword, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: '/invite-team' },
  { loc: AppPath.ResetPassword, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_CALL, res: AppPath.BookCall },
  { loc: AppPath.ResetPassword, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.VerifyEmail, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.VerifyEmail, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, verifyEmailRedirectPath: '/nextPath?key=value', res: '/nextPath?key=value' },
  { loc: AppPath.VerifyEmail, isLogged: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.VerifyEmail, isLogged: false, isWorkspaceSuspended: false, onboardingStatus: undefined, verifyEmailRedirectPath: '/nextPath?key=value', res: undefined },
  { loc: AppPath.VerifyEmail, isLogged: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: undefined },
  { loc: AppPath.VerifyEmail, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.WorkspaceActivation },
  { loc: AppPath.VerifyEmail, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.VerifyEmail, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.VerifyEmail, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.APPS_INSTALLATION, res: AppPath.InstallApps },
  { loc: AppPath.VerifyEmail, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.VerifyEmail, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_CALL, res: AppPath.BookCall },
  { loc: AppPath.VerifyEmail, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.WorkspaceActivation, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.WorkspaceActivation, isLogged: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.WorkspaceActivation, isLogged: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.WorkspaceActivation, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: undefined },
  { loc: AppPath.WorkspaceActivation, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.WorkspaceActivation, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.WorkspaceActivation, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.APPS_INSTALLATION, res: AppPath.InstallApps },
  { loc: AppPath.WorkspaceActivation, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.WorkspaceActivation, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_CALL, res: AppPath.BookCall },
  { loc: AppPath.WorkspaceActivation, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.CreateProfile, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.CreateProfile, isLogged: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.CreateProfile, isLogged: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.CreateProfile, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.WorkspaceActivation },
  { loc: AppPath.CreateProfile, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: undefined },
  { loc: AppPath.CreateProfile, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.CreateProfile, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.APPS_INSTALLATION, res: AppPath.InstallApps },
  { loc: AppPath.CreateProfile, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.CreateProfile, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_CALL, res: AppPath.BookCall },
  { loc: AppPath.CreateProfile, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.SyncEmails, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.SyncEmails, isLogged: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.SyncEmails, isLogged: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.SyncEmails, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.WorkspaceActivation },
  { loc: AppPath.SyncEmails, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.SyncEmails, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: undefined },
  { loc: AppPath.SyncEmails, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.APPS_INSTALLATION, res: AppPath.InstallApps },
  { loc: AppPath.SyncEmails, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.SyncEmails, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_CALL, res: AppPath.BookCall },
  { loc: AppPath.SyncEmails, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.InstallApps, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.InstallApps, isLogged: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.InstallApps, isLogged: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.InstallApps, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.WorkspaceActivation },
  { loc: AppPath.InstallApps, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.InstallApps, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.InstallApps, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.APPS_INSTALLATION, res: undefined },
  { loc: AppPath.InstallApps, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.InstallApps, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_CALL, res: AppPath.BookCall },
  { loc: AppPath.InstallApps, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.InviteTeam, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.InviteTeam, isLogged: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.InviteTeam, isLogged: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.InviteTeam, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.WorkspaceActivation },
  { loc: AppPath.InviteTeam, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.InviteTeam, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.InviteTeam, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.APPS_INSTALLATION, res: AppPath.InstallApps },
  { loc: AppPath.InviteTeam, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: undefined },
  { loc: AppPath.InviteTeam, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_CALL, res: AppPath.BookCall },
  { loc: AppPath.InviteTeam, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: AppPath.PlanRequired },

  { loc: AppPath.BookCall, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: undefined },
  { loc: AppPath.BookCall, isLogged: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.BookCall, isLogged: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.BookCall, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.WorkspaceActivation },
  { loc: AppPath.BookCall, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.BookCall, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.BookCall, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.APPS_INSTALLATION, res: AppPath.InstallApps },
  { loc: AppPath.BookCall, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.BookCall, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_CALL, res: undefined },
  { loc: AppPath.BookCall, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.PlanRequired, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: undefined },
  { loc: AppPath.PlanRequired, isLogged: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.PlanRequired, isLogged: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.PlanRequired, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.WorkspaceActivation },
  { loc: AppPath.PlanRequired, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.PlanRequired, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.PlanRequired, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.APPS_INSTALLATION, res: AppPath.InstallApps },
  { loc: AppPath.PlanRequired, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.PlanRequired, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_CALL, res: AppPath.BookCall },
  { loc: AppPath.PlanRequired, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.PlanRequiredSuccess, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: undefined },
  { loc: AppPath.PlanRequiredSuccess, isLogged: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.PlanRequiredSuccess, isLogged: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.PlanRequiredSuccess, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.WorkspaceActivation },
  { loc: AppPath.PlanRequiredSuccess, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.PlanRequiredSuccess, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.PlanRequiredSuccess, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.APPS_INSTALLATION, res: AppPath.InstallApps },
  { loc: AppPath.PlanRequiredSuccess, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.PlanRequiredSuccess, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_CALL, res: AppPath.BookCall },
  { loc: AppPath.PlanRequiredSuccess, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.Index, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.Index, isLogged: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.Index, isLogged: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.Index, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.WorkspaceActivation },
  { loc: AppPath.Index, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.Index, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.Index, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.APPS_INSTALLATION, res: AppPath.InstallApps },
  { loc: AppPath.Index, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.Index, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_CALL, res: AppPath.BookCall },
  { loc: AppPath.Index, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.TasksPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.TasksPage, isLogged: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.TasksPage, isLogged: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.TasksPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.WorkspaceActivation },
  { loc: AppPath.TasksPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.TasksPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.TasksPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.APPS_INSTALLATION, res: AppPath.InstallApps },
  { loc: AppPath.TasksPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.TasksPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_CALL, res: AppPath.BookCall },
  { loc: AppPath.TasksPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.AiChat, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.AiChat, isLogged: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.AiChat, isLogged: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.AiChat, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.WorkspaceActivation },
  { loc: AppPath.AiChat, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.AiChat, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.AiChat, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.APPS_INSTALLATION, res: AppPath.InstallApps },
  { loc: AppPath.AiChat, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.AiChat, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_CALL, res: AppPath.BookCall },
  { loc: AppPath.AiChat, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.OpportunitiesPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.OpportunitiesPage, isLogged: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.OpportunitiesPage, isLogged: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.OpportunitiesPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.WorkspaceActivation },
  { loc: AppPath.OpportunitiesPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.OpportunitiesPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.OpportunitiesPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.APPS_INSTALLATION, res: AppPath.InstallApps },
  { loc: AppPath.OpportunitiesPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.OpportunitiesPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_CALL, res: AppPath.BookCall },
  { loc: AppPath.OpportunitiesPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.RecordIndexPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.RecordIndexPage, isLogged: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.RecordIndexPage, isLogged: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.RecordIndexPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.WorkspaceActivation },
  { loc: AppPath.RecordIndexPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.RecordIndexPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.RecordIndexPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.APPS_INSTALLATION, res: AppPath.InstallApps },
  { loc: AppPath.RecordIndexPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.RecordIndexPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_CALL, res: AppPath.BookCall },
  { loc: AppPath.RecordIndexPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },
  { loc: AppPath.RecordIndexPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined, objectNamePluralFromParams: 'existing-object', objectNamePluralFromMetadata: 'existing-object' },
  { loc: AppPath.RecordIndexPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: AppPath.NotFound, objectNamePluralFromParams: 'non-existing-object', objectNamePluralFromMetadata: 'existing-object' },
  { loc: AppPath.RecordIndexPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined, objectNamePluralFromParams: 'non-existing-object', objectNamePluralFromMetadata: 'existing-object', isMinimalMetadataReady: false },

  { loc: AppPath.RecordShowPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.RecordShowPage, isLogged: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.RecordShowPage, isLogged: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.RecordShowPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.WorkspaceActivation },
  { loc: AppPath.RecordShowPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.RecordShowPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.RecordShowPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.APPS_INSTALLATION, res: AppPath.InstallApps },
  { loc: AppPath.RecordShowPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.RecordShowPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_CALL, res: AppPath.BookCall },
  { loc: AppPath.RecordShowPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.PageLayoutPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.PageLayoutPage, isLogged: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.PageLayoutPage, isLogged: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.PageLayoutPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.WorkspaceActivation },
  { loc: AppPath.PageLayoutPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.PageLayoutPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.PageLayoutPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.APPS_INSTALLATION, res: AppPath.InstallApps },
  { loc: AppPath.PageLayoutPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.PageLayoutPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_CALL, res: AppPath.BookCall },
  { loc: AppPath.PageLayoutPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },
  { loc: AppPath.PageLayoutPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined, pageLayoutId: 'valid-id', useQueryResult: { loading: true } },
  { loc: AppPath.PageLayoutPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: AppPath.NotFound, pageLayoutId: 'non-existent-id', useQueryResult: { data: { getPageLayout: null }, loading: false } },
  { loc: AppPath.PageLayoutPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: AppPath.NotFound, pageLayoutId: 'wrong-type-id', useQueryResult: { data: { getPageLayout: { type: PageLayoutType.RECORD_PAGE } }, loading: false } },
  { loc: AppPath.PageLayoutPage, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined, pageLayoutId: 'valid-standalone-id', useQueryResult: { data: { getPageLayout: { type: PageLayoutType.STANDALONE_PAGE } }, loading: false } },

  { loc: AppPath.SettingsCatchAll, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.SettingsCatchAll, isLogged: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },
  { loc: AppPath.SettingsCatchAll, isLogged: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.SettingsCatchAll, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.WorkspaceActivation },
  { loc: AppPath.SettingsCatchAll, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.SettingsCatchAll, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.SettingsCatchAll, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.APPS_INSTALLATION, res: AppPath.InstallApps },
  { loc: AppPath.SettingsCatchAll, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.SettingsCatchAll, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_CALL, res: AppPath.BookCall },
  { loc: AppPath.SettingsCatchAll, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.DevelopersCatchAll, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.DevelopersCatchAll, isLogged: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.DevelopersCatchAll, isLogged: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.DevelopersCatchAll, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.WorkspaceActivation },
  { loc: AppPath.DevelopersCatchAll, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.DevelopersCatchAll, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.DevelopersCatchAll, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.APPS_INSTALLATION, res: AppPath.InstallApps },
  { loc: AppPath.DevelopersCatchAll, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.DevelopersCatchAll, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_CALL, res: AppPath.BookCall },
  { loc: AppPath.DevelopersCatchAll, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.Authorize, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.Authorize, isLogged: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.Authorize, isLogged: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.Authorize, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.WorkspaceActivation },
  { loc: AppPath.Authorize, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.Authorize, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.Authorize, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.APPS_INSTALLATION, res: AppPath.InstallApps },
  { loc: AppPath.Authorize, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.Authorize, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_CALL, res: AppPath.BookCall },
  { loc: AppPath.Authorize, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.NotFoundWildcard, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.NotFoundWildcard, isLogged: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.NotFoundWildcard, isLogged: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.NotFoundWildcard, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.WorkspaceActivation },
  { loc: AppPath.NotFoundWildcard, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.NotFoundWildcard, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.NotFoundWildcard, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.APPS_INSTALLATION, res: AppPath.InstallApps },
  { loc: AppPath.NotFoundWildcard, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.NotFoundWildcard, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_CALL, res: AppPath.BookCall },
  { loc: AppPath.NotFoundWildcard, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.NotFound, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.NotFound, isLogged: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: getSettingsPath(SettingsPath.Billing) },
  { loc: AppPath.NotFound, isLogged: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.NotFound, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.WorkspaceActivation },
  { loc: AppPath.NotFound, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.NotFound, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.NotFound, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.APPS_INSTALLATION, res: AppPath.InstallApps },
  { loc: AppPath.NotFound, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.NotFound, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.BOOK_CALL, res: AppPath.BookCall },
  { loc: AppPath.NotFound, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  // isBillingEnabled:false — no post-invite-team upgrade interception on billing-disabled instances
  { loc: AppPath.InviteTeam, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, isBillingEnabled: false, res: defaultHomePagePath },
  { loc: AppPath.PlanRequired, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, isBillingEnabled: false, res: defaultHomePagePath },

  // returnToPath: should redirect to saved path instead of defaultHomePagePath
  { loc: AppPath.Verify, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, returnToPath: '/authorize?clientId=abc', res: '/authorize?clientId=abc' },
  { loc: AppPath.SignInUp, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, returnToPath: '/objects/tasks', res: '/objects/tasks' },
  { loc: AppPath.Index, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, returnToPath: '/settings/api-keys', res: '/settings/api-keys' },

  { loc: AppPath.InviteTeam, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, isBillingEnabled: false, shouldOpenAiChatAfterOnboarding: true, res: AppPath.WorkspaceSetup },
  { loc: AppPath.InviteTeam, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, isBillingEnabled: false, shouldOpenAiChatAfterOnboarding: false, res: defaultHomePagePath },
  { loc: AppPath.PlanRequiredSuccess, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, shouldOpenAiChatAfterOnboarding: true, res: AppPath.WorkspaceSetup },
  { loc: AppPath.SignInUp, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, shouldOpenAiChatAfterOnboarding: true, returnToPath: '/objects/tasks', res: '/objects/tasks' },

  { loc: AppPath.PlanRequiredSuccess, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, isOnboardingCheckoutPending: true, res: undefined },
  { loc: AppPath.Verify, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, isOnboardingCheckoutPending: true, res: defaultHomePagePath },

  // isOnAWorkspace:false — on default domain, don't redirect to returnToPath or defaultHomePagePath from auth pages
  { loc: AppPath.Verify, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, isOnAWorkspace: false, res: undefined },
  { loc: AppPath.SignInUp, isLogged: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, isOnAWorkspace: false, res: undefined },
];

describe('usePageChangeEffectNavigateLocation', () => {
  it.each(testCases)(
    'with location $loc and onboardingStatus $onboardingStatus and isWorkspaceSuspended $isWorkspaceSuspended should return $res`',
    ({
      loc,
      onboardingStatus,
      isWorkspaceSuspended,
      isLogged,
      isOnAWorkspace,
      objectNamePluralFromParams,
      objectNamePluralFromMetadata,
      verifyEmailRedirectPath,
      returnToPath,
      pageLayoutId,
      useQueryResult,
      isBillingEnabled,
      isMinimalMetadataReady,
      shouldOpenAiChatAfterOnboarding,
      isOnboardingCheckoutPending,
      res,
    }) => {
      setupMockIsMatchingLocation(loc);
      setupMockOnboardingStatus(onboardingStatus);
      setupMockIsWorkspaceActivationStatusEqualsTo(isWorkspaceSuspended);
      setupMockIsLogged(isLogged);
      setupMockIsOnAWorkspace(isOnAWorkspace ?? true);
      setupMockUseQuery(useQueryResult);
      setupMockUseParams(objectNamePluralFromParams, pageLayoutId);
      setupMockState(
        objectNamePluralFromMetadata,
        verifyEmailRedirectPath,
        returnToPath,
        undefined,
        isBillingEnabled ?? true,
        isMinimalMetadataReady ?? true,
        shouldOpenAiChatAfterOnboarding ?? false,
        isOnboardingCheckoutPending ?? false,
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
          ['nonExistingObjectInParam:metadataNotReady'].length +
          ['caseWithRedirectionToVerifyEmailRedirectPath', 'caseWithout']
            .length +
          [
            'pageLayout:loading',
            'pageLayout:missing',
            'pageLayout:wrongType',
            'pageLayout:validStandalone',
          ].length +
          ['returnToPath:verify', 'returnToPath:signInUp', 'returnToPath:index']
            .length +
          ['notOnWorkspace:verify', 'notOnWorkspace:signInUp'].length +
          [
            'billingDisabled:inviteTeamCompleted',
            'billingDisabled:planRequiredCompleted',
          ].length +
          [
            'workspaceSetupPending:inviteTeamCompleted',
            'workspaceSetupNotPending:inviteTeamCompleted',
            'workspaceSetupPending:paymentSuccessCompleted',
            'workspaceSetupPending:returnToPathWins',
            'checkoutPending:paymentSuccessDefersRedirect',
            'checkoutPending:verifyStillRedirects',
          ].length,
      );
    });
  });
});

describe('usePageChangeEffectNavigateLocation — authenticated with no current workspace', () => {
  it.each([AppPath.Index, AppPath.TasksPage, AppPath.SettingsCatchAll])(
    'redirects to SignInUp from %s when authenticated with no current workspace',
    (loc) => {
      setupMockIsMatchingLocation(loc);
      setupMockOnboardingStatus(undefined);
      setupMockIsWorkspaceActivationStatusEqualsTo(false);
      setupMockIsLogged(true);
      setupMockIsOnAWorkspace(true);
      setupMockUseQuery();
      setupMockUseParams();
      setupMockState(undefined, undefined, undefined, null);

      expect(usePageChangeEffectNavigateLocation()).toEqual(AppPath.SignInUp);
    },
  );
});
