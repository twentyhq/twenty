import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { getUserIdFromToken } from '@/auth/services/AuthService';
import { currentUserState } from '@/auth/states/currentUserState';
import { isAuthenticatingState } from '@/auth/states/isAuthenticatingState';
import { useGetCurrentUserQuery } from '@/users/services';

type OwnProps = {
  children: JSX.Element;
};

export function AuthProvider({ children }: OwnProps) {
  const [, setCurrentUser] = useRecoilState(currentUserState);
  const [, setIsAuthenticating] = useRecoilState(isAuthenticatingState);

  const userIdFromToken = getUserIdFromToken();

  const { data } = useGetCurrentUserQuery(userIdFromToken);
  const user = data?.users?.[0];
  useEffect(() => {
    if (user) {
      setCurrentUser(user);
      setIsAuthenticating(false);
    }
  }, [user, setCurrentUser, setIsAuthenticating]);

  return <>{children}</>;
}
