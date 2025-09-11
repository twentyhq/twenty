import { type AuthTokenPair } from '~/generated/graphql';

export const isValidAuthTokenPair = (
  tokenPair: any,
): tokenPair is AuthTokenPair => {
  return (
    tokenPair &&
    typeof tokenPair === 'object' &&
    tokenPair.accessOrWorkspaceAgnosticToken &&
    typeof tokenPair.accessOrWorkspaceAgnosticToken === 'object' &&
    typeof tokenPair.accessOrWorkspaceAgnosticToken.token === 'string'
  );
};
