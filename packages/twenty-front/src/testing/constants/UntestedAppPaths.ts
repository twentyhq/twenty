import { AppPath } from 'twenty-shared/types';

export const UNTESTED_APP_PATHS = [
  AppPath.Settings,
  AppPath.Developers,
  // Public, unauthenticated redirect route handled in useCreateWorkspaceAppRouter
  // — not part of the onboarding/auth page-change navigation matrix.
  AppPath.Dpa,
];
