import jwt from 'jwt-decode';

import { AuthTokenPair, useGetCurrentUserQuery } from '~/generated/graphql';

export function useFetchCurrentUser(tokenPair: AuthTokenPair | null) {
  const userId = tokenPair?.accessToken.token
    ? jwt<{ sub: string }>(tokenPair.accessToken.token).sub
    : null;
  const { data } = useGetCurrentUserQuery({
    variables: { uuid: userId },
  });
  return data?.users?.[0];
}
