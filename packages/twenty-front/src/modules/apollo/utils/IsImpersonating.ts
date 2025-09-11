import { isDefined } from 'twenty-shared/utils';
import { getImpersonationTokensFromStorage } from './getImpersonationTokensFromStorage.ts.js';

export const isImpersonating = (): boolean => {
  return isDefined(getImpersonationTokensFromStorage());
};
