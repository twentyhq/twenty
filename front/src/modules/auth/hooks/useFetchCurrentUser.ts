import { useEffect } from 'react';
import jwt from 'jwt-decode';
import { useRecoilState } from 'recoil';

import { useGetCurrentUserQuery } from '~/generated/graphql';

import { currentUserState } from '../states/currentUserState';
import { tokenPairState } from '../states/tokenPairState';

export function useFetchCurrentUser() {
  const [, setCurrentUser] = useRecoilState(currentUserState);
  const [tokenPair] = useRecoilState(tokenPairState);
  const userId = tokenPair?.accessToken.token
    ? jwt<{ sub: string }>(tokenPair.accessToken.token).sub
    : null;
  const { data } = useGetCurrentUserQuery({
    variables: { uuid: userId },
  });
  const user = data?.users?.[0];

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user, setCurrentUser]);
}
