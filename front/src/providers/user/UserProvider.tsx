import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { useGetCurrentUserQuery } from '~/generated/graphql';

export function UserProvider({ children }: React.PropsWithChildren) {
  const [, setCurrentUser] = useRecoilState(currentUserState);
  const { data } = useGetCurrentUserQuery();

  useEffect(() => {
    if (data?.currentUser) {
      setCurrentUser(data?.currentUser);
    }
  }, [setCurrentUser, data]);

  return <>{children}</>;
}
