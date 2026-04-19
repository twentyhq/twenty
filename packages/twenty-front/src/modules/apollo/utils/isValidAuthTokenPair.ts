import { type AuthTokenPair } from '~/generated-metadata/graphql';

export const isValidAuthTokenPair = (
  tokenPair: any,
): tokenPair is AuthTokenPair => {
  return (
    tokenPair &&
    typeof tokenPair === 'object' &&
    tokenPair.acceSsorWorkspaceAgnosticToken &&
    typeof tokenPair.acceSsorWorkspaceAgnosticToken === 'object' &&
    typeof tokenPair.acceSsorWorkspaceAgnosticToken.token === 'string'
  );
};
