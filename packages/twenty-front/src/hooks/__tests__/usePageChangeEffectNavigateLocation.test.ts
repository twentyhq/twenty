import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { AppPath } from '@/types/AppPath';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { OnboardingStatus } from '~/generated/graphql';

import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';
import { usePageChangeEffectNavigateLocation } from '~/hooks/usePageChangeEffectNavigateLocation';
import { UNTESTED_APP_PATHS } from '~/testing/constants/UntestedAppPaths';

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

jest.mock('~/hooks/useIsMatchingLocation');
const mockUseIsMatchingLocation = jest.mocked(useIsMatchingLocation);

const setupMockIsMatchingLocation = (pathname: string) => {
  mockUseIsMatchingLocation.mockReturnValueOnce({
    isMatchingLocation: (path: string) => path === pathname,
  });
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

jest.mock('react-router-dom');
const setupMockUseParams = (objectNamePlural?: string) => {
  jest
    .mocked(useParams)
    .mockReturnValueOnce({ objectNamePlural: objectNamePlural ?? '' });
};

jest.mock('recoil');
const setupMockRecoil = (objectNamePlural?: string) => {
  jest
    .mocked(useRecoilValue)
    .mockReturnValueOnce([{ namePlural: objectNamePlural ?? '' }]);
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
}[] = [
  { loc: AppPath.Verify, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.Verify, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: '/settings/billing' },
  { loc: AppPath.Verify, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: undefined },
  { loc: AppPath.Verify, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.Verify, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.Verify, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.Verify, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.Verify, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.SignInUp, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.SignInUp, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: '/settings/billing' },
  { loc: AppPath.SignInUp, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: undefined },
  { loc: AppPath.SignInUp, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.SignInUp, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.SignInUp, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.SignInUp, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.SignInUp, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.Invite, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: '/plan-required' },
  { loc: AppPath.Invite, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: '/settings/billing' },
  { loc: AppPath.Invite, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: undefined },
  { loc: AppPath.Invite, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: '/create/workspace' },
  { loc: AppPath.Invite, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: '/create/profile' },
  { loc: AppPath.Invite, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: '/sync/emails' },
  { loc: AppPath.Invite, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: '/invite-team' },
  { loc: AppPath.Invite, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: '/objects/companies' },

  { loc: AppPath.ResetPassword, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: '/plan-required' },
  { loc: AppPath.ResetPassword, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: '/settings/billing' },
  { loc: AppPath.ResetPassword, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: undefined },
  { loc: AppPath.ResetPassword, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: '/create/workspace' },
  { loc: AppPath.ResetPassword, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: '/create/profile' },
  { loc: AppPath.ResetPassword, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: '/sync/emails' },
  { loc: AppPath.ResetPassword, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: '/invite-team' },
  { loc: AppPath.ResetPassword, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: '/objects/companies' },

  { loc: AppPath.VerifyEmail, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.VerifyEmail, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: '/settings/billing' },
  { loc: AppPath.VerifyEmail, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: undefined },
  { loc: AppPath.VerifyEmail, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.VerifyEmail, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.VerifyEmail, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.VerifyEmail, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.VerifyEmail, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.CreateWorkspace, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.CreateWorkspace, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: '/settings/billing' },
  { loc: AppPath.CreateWorkspace, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.CreateWorkspace, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: undefined },
  { loc: AppPath.CreateWorkspace, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.CreateWorkspace, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.CreateWorkspace, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.CreateWorkspace, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.CreateProfile, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.CreateProfile, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: '/settings/billing' },
  { loc: AppPath.CreateProfile, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.CreateProfile, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.CreateProfile, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: undefined },
  { loc: AppPath.CreateProfile, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.CreateProfile, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.CreateProfile, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.SyncEmails, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.SyncEmails, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: '/settings/billing' },
  { loc: AppPath.SyncEmails, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.SyncEmails, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.SyncEmails, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.SyncEmails, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: undefined },
  { loc: AppPath.SyncEmails, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.SyncEmails, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.InviteTeam, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.InviteTeam, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: '/settings/billing' },
  { loc: AppPath.InviteTeam, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.InviteTeam, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.InviteTeam, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.InviteTeam, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.InviteTeam, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: undefined },
  { loc: AppPath.InviteTeam, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.PlanRequired, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: undefined },
  { loc: AppPath.PlanRequired, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: '/settings/billing' },
  { loc: AppPath.PlanRequired, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.PlanRequired, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.PlanRequired, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.PlanRequired, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.PlanRequired, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.PlanRequired, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.PlanRequiredSuccess, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: undefined },
  { loc: AppPath.PlanRequiredSuccess, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: '/settings/billing' },
  { loc: AppPath.PlanRequiredSuccess, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.PlanRequiredSuccess, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: undefined },
  { loc: AppPath.PlanRequiredSuccess, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.PlanRequiredSuccess, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.PlanRequiredSuccess, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.PlanRequiredSuccess, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.Index, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.Index, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: '/settings/billing' },
  { loc: AppPath.Index, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.Index, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.Index, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.Index, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.Index, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.Index, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: defaultHomePagePath },

  { loc: AppPath.TasksPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.TasksPage, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: '/settings/billing' },
  { loc: AppPath.TasksPage, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.TasksPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.TasksPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.TasksPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.TasksPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.TasksPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.OpportunitiesPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.OpportunitiesPage, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: '/settings/billing' },
  { loc: AppPath.OpportunitiesPage, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.OpportunitiesPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.OpportunitiesPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.OpportunitiesPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.OpportunitiesPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.OpportunitiesPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.RecordIndexPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.RecordIndexPage, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: '/settings/billing' },
  { loc: AppPath.RecordIndexPage, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.RecordIndexPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.RecordIndexPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.RecordIndexPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.RecordIndexPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.RecordIndexPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },
  { loc: AppPath.RecordIndexPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined, objectNamePluralFromParams: 'existing-object', objectNamePluralFromMetadata: 'existing-object' },
  { loc: AppPath.RecordIndexPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: AppPath.NotFound, objectNamePluralFromParams: 'non-existing-object', objectNamePluralFromMetadata: 'existing-object' },

  { loc: AppPath.RecordShowPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.RecordShowPage, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: '/settings/billing' },
  { loc: AppPath.RecordShowPage, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.RecordShowPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.RecordShowPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.RecordShowPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.RecordShowPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.RecordShowPage, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.SettingsCatchAll, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.SettingsCatchAll, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },
  { loc: AppPath.SettingsCatchAll, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.SettingsCatchAll, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.SettingsCatchAll, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.SettingsCatchAll, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.SettingsCatchAll, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.SettingsCatchAll, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.DevelopersCatchAll, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.DevelopersCatchAll, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: '/settings/billing' },
  { loc: AppPath.DevelopersCatchAll, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.DevelopersCatchAll, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.DevelopersCatchAll, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.DevelopersCatchAll, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.DevelopersCatchAll, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.DevelopersCatchAll, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.Authorize, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.Authorize, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: '/settings/billing' },
  { loc: AppPath.Authorize, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.Authorize, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.Authorize, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.Authorize, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.Authorize, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.Authorize, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.NotFoundWildcard, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.NotFoundWildcard, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: '/settings/billing' },
  { loc: AppPath.NotFoundWildcard, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.NotFoundWildcard, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.NotFoundWildcard, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.NotFoundWildcard, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.NotFoundWildcard, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.NotFoundWildcard, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },

  { loc: AppPath.NotFound, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PLAN_REQUIRED, res: AppPath.PlanRequired },
  { loc: AppPath.NotFound, isLoggedIn: true, isWorkspaceSuspended: true, onboardingStatus: OnboardingStatus.COMPLETED, res: '/settings/billing' },
  { loc: AppPath.NotFound, isLoggedIn: false, isWorkspaceSuspended: false, onboardingStatus: undefined, res: AppPath.SignInUp },
  { loc: AppPath.NotFound, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION, res: AppPath.CreateWorkspace },
  { loc: AppPath.NotFound, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.PROFILE_CREATION, res: AppPath.CreateProfile },
  { loc: AppPath.NotFound, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.SYNC_EMAIL, res: AppPath.SyncEmails },
  { loc: AppPath.NotFound, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.INVITE_TEAM, res: AppPath.InviteTeam },
  { loc: AppPath.NotFound, isLoggedIn: true, isWorkspaceSuspended: false, onboardingStatus: OnboardingStatus.COMPLETED, res: undefined },
];

describe('usePageChangeEffectNavigateLocation', () => {
  testCases.forEach((testCase) => {
    it(`with location ${testCase.loc} and onboardingStatus ${testCase.onboardingStatus} and isWorkspaceSuspended ${testCase.isWorkspaceSuspended} should return ${testCase.res}`, () => {
      setupMockIsMatchingLocation(testCase.loc);
      setupMockOnboardingStatus(testCase.onboardingStatus);
      setupMockIsWorkspaceActivationStatusEqualsTo(
        testCase.isWorkspaceSuspended,
      );
      setupMockIsLogged(testCase.isLoggedIn);
      setupMockUseParams(testCase.objectNamePluralFromParams);
      setupMockRecoil(testCase.objectNamePluralFromMetadata);

      expect(usePageChangeEffectNavigateLocation()).toEqual(testCase.res);
    });
  });

  describe('tests should be exhaustive', () => {
    it('all location, onboarding status and suspended/not suspended workspace activation status should be tested', () => {
      expect(testCases.length).toEqual(
        (Object.keys(AppPath).length - UNTESTED_APP_PATHS.length) *
          (Object.keys(OnboardingStatus).length +
            ['isWorkspaceSuspended:true', 'isWorkspaceSuspended:false']
              .length) +
          ['nonExistingObjectInParam', 'existingObjectInParam:false'].length,
      );
    });
  });
});
