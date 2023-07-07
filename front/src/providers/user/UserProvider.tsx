import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { currentUserState } from '@/auth/states/currentUserState';
import { useGetCurrentUserQuery } from '~/generated/graphql';

export function UserProvider({ children }: React.PropsWithChildren) {
  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);
  const isLoggedIn = useIsLogged();
  const { data, loading } = useGetCurrentUserQuery();

  useEffect(() => {
    if (data?.currentUser) {
      setCurrentUser(data?.currentUser);
    }
  }, [setCurrentUser, data]);

  return loading || (isLoggedIn && !currentUser) ? <></> : <>{children}</>;
}
