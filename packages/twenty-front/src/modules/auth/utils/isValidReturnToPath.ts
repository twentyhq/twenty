import { isSafeInternalPath } from 'twenty-shared/utils';
import { ONBOARDING_PATHS } from '@/auth/constants/OnboardingPaths';
import { ONGOING_USER_CREATION_PATHS } from '@/auth/constants/OngoingUserCreationPaths';
import { AppPath } from 'twenty-shared/types';

const extractPathPrefix = (appPath: string): string => appPath.split('/:')[0];

const EXCLUDED_PATH_PREFIXES = [
  ...ONGOING_USER_CREATION_PATHS,
  ...ONBOARDING_PATHS,
  AppPath.ResetPassword,
].map(extractPathPrefix);

export const isValidReturnToPath = (path: string): boolean => {
  // Hash-only paths pass isSafeInternalPath but leave a login redirect nowhere to land.
  if (!isSafeInternalPath(path) || !path.startsWith('/') || path === '/') {
    return false;
  }

  return !EXCLUDED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
};
