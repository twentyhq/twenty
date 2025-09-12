import { isDefined } from 'twenty-shared/utils';
import { getImpersonationTokens } from './getImpersonationTokens';

export const isImpersonating = (): boolean => {
  return isDefined(getImpersonationTokens());
};
