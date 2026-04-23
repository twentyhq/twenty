import { ONBOARDING_PATHS } from '@/auth/constants/OnboardingPaths';
import { ONGOING_USER_CREATION_PATHS } from '@/auth/constants/OngoingUserCreationPaths';
import { isNonEmptyString } from '@sniptt/guards';
import { AppPath } from 'twenty-shared/types';

const extractPathPrefix = (appPath: string): string => appPath.split('/:')[0];

const EXCLUDED_PATH_PREFIXES = [
  ...ONGOING_USER_CREATION_PATHS,
  ...ONBOARDING_PATHS,
  AppPath.ResetPassword,
].map(extractPathPrefix);

export const isValidReturnToPath = (path: string): boolean => {
  if (!isNonEmptyString(path) || path === '/') {
    return false;
  }

  if (!path.startsWith('/') || path.startsWith('//')) {
    return false;
  }

  return !EXCLUDED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
};
