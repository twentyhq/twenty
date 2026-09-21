import { AppPath } from 'twenty-shared/types';

export const UNTESTED_APP_PATHS = [
  AppPath.Settings,
  AppPath.Developers,
  // Auth-aware redirect route handled in useCreateWorkspaceAppRouter and useCreateRootAppRouter
  // — not part of the onboarding/auth page-change navigation matrix.
  AppPath.Dpa,
];
