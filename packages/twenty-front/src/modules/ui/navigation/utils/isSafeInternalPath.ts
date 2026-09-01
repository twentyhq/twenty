import { isNonEmptyString } from '@sniptt/guards';

export const isSafeInternalPath = (path: string): boolean =>
  isNonEmptyString(path) &&
  path.startsWith('/') &&
  !path.startsWith('//') &&
  !path.includes('\\');
