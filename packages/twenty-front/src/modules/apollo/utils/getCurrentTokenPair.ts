import { type AuthTokenPair } from '~/generated/graphql';
import { getImpersonationTokens } from './getImpersonationTokens';
import { getTokenPair } from './getTokenPair';

export const getCurrentTokenPair = (): AuthTokenPair | undefined => {
  return getImpersonationTokens() ?? getTokenPair();
};
