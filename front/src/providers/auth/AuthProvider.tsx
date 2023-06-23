import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { getUserIdFromToken } from '@/auth/services/AuthService';
import { currentUserState } from '@/auth/states/currentUserState';
import { isAuthenticatingState } from '@/auth/states/isAuthenticatingState';
import { useGetCurrentUserQuery } from '~/generated/graphql';

type OwnProps = {
  children: JSX.Element;
};

export function AuthProvider({ children }: OwnProps) {
  const [, setCurrentUser] = useRecoilState(currentUserState);
  const [, setIsAuthenticating] = useRecoilState(isAuthenticatingState);

  const userIdFromToken = getUserIdFromToken();
  const isLogged = useIsLogged();

  const { data } = useGetCurrentUserQuery({
    variables: {
      uuid: userIdFromToken,
    },
    skip: !isLogged || !userIdFromToken,
  });

  const user = data?.users?.[0];

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
      setIsAuthenticating(false);
    }
  }, [user, setCurrentUser, setIsAuthenticating]);

  return <>{children}</>;
}
