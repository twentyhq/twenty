import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { currentUserState } from '@/auth/states/currentUserState';
import { useGetCurrentUserQuery } from '~/generated/graphql';

export function UserProvider({ children }: React.PropsWithChildren) {
  const [, setCurrentUser] = useRecoilState(currentUserState);
  const [isLoading, setIsLoading] = useState(true);

  const isLogged = useIsLogged();

  const { data, loading } = useGetCurrentUserQuery({
    skip: !isLogged,
  });

  console.log('UserProvider', JSON.stringify({ data, loading, isLogged }));

  useEffect(() => {
    if (!loading) {
      setIsLoading(false);
    }
    if (data?.currentUser) {
      setCurrentUser(data?.currentUser);
    }
  }, [setCurrentUser, data, isLoading, loading]);

  return isLoading ? <></> : <>{children}</>;
}
