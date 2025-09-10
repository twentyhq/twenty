import { isDefined } from 'twenty-shared/utils';
import { getImpersonationTokensFromStorage } from './getImpersonationTokensFromStorage.ts.js';

export const getIsImpersonating = (): boolean => {
  return isDefined(getImpersonationTokensFromStorage());
};
