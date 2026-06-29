import { AppPath } from 'twenty-shared/types';

export const UNTESTED_APP_PATHS = [
  AppPath.Settings,
  AppPath.Developers,
  AppPath.VerifyV2,
  AppPath.WorkspaceActivationV2,
  AppPath.CreateProfileV2,
  AppPath.SyncEmailsV2,
  AppPath.InviteTeamV2,
  AppPath.PlanRequiredV2,
  // Public, unauthenticated redirect route handled in useCreateAppRouter — not
  // part of the onboarding/auth page-change navigation matrix.
  AppPath.Dpa,
];
