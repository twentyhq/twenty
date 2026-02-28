import { isNonEmptyString } from '@sniptt/guards';

const EXCLUDED_PATH_PREFIXES = [
  '/welcome',
  '/verify',
  '/invite',
  '/reset-password',
  '/create/',
  '/sync/',
  '/invite-team',
  '/plan-required',
  '/book-call',
];

export const isValidReturnToPath = (path: string): boolean => {
  if (!isNonEmptyString(path) || path === '/') {
    return false;
  }

  if (!path.startsWith('/')) {
    return false;
  }

  return !EXCLUDED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
};
