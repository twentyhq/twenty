import { type AuthTokenPair } from '~/generated/graphql';
import { getImpersonationTokensFromStorage } from './getImpersonationTokensFromStorage.ts.js';
import { getTokenPair } from './getTokenPair.js';

export const getCurrentTokenPair = (): AuthTokenPair | undefined => {
  return getImpersonationTokensFromStorage() ?? getTokenPair();
};
