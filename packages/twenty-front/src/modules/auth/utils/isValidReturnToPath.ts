import { ONBOARDING_PATHS } from '@/auth/constants/OnboardingPaths';
import { ONGOING_USER_CREATION_PATHS } from '@/auth/constants/OngoingUserCreationPaths';
import { isSafeInternalPath } from '@/ui/navigation/utils/isSafeInternalPath';
import { AppPath } from 'twenty-shared/types';

const extractPathPrefix = (appPath: string): string => appPath.split('/:')[0];

const EXCLUDED_PATH_PREFIXES = [
  ...ONGOING_USER_CREATION_PATHS,
  ...ONBOARDING_PATHS,
  AppPath.ResetPassword,
].map(extractPathPrefix);

export const isValidReturnToPath = (path: string): boolean => {
  // Redirecting after login needs a page to land on, so the hash-only paths
  // isSafeInternalPath allows are not valid here.
  if (!isSafeInternalPath(path) || !path.startsWith('/') || path === '/') {
    return false;
  }

  return !EXCLUDED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
};
