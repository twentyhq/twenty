import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { getUserIdFromToken } from '@/auth/services/AuthService';
import { currentUserState } from '@/auth/states/currentUserState';
import { isAuthenticatingState } from '@/auth/states/isAuthenticatingState';
import { mapToUser } from '@/users/interfaces/user.interface';
import { useGetCurrentUserQuery } from '@/users/services';

type OwnProps = {
  children: JSX.Element;
};

export function AuthProvider({ children }: OwnProps) {
  const [, setCurrentUser] = useRecoilState(currentUserState);
  const [, setIsAuthenticating] = useRecoilState(isAuthenticatingState);

  const userIdFromToken = getUserIdFromToken();
  const { data } = useGetCurrentUserQuery(userIdFromToken);

  useEffect(() => {
    if (data?.users[0]) {
      setCurrentUser(mapToUser(data?.users?.[0]));
      setIsAuthenticating(false);
    }
  }, [data, setCurrentUser, setIsAuthenticating]);

  return <>{children}</>;
}
