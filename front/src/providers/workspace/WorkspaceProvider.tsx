import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

import { currentWorkspaceState } from '@/workspace/states/currentWorkspaceState';
import { useGetCurrentWorkspaceQuery } from '~/generated/graphql';

export function WorkspaceProvider({ children }: React.PropsWithChildren) {
  const [, setCurrentWorkspace] = useRecoilState(currentWorkspaceState);
  const { data, loading } = useGetCurrentWorkspaceQuery();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      setIsLoading(false);
    }
    if (data?.currentWorkspace) {
      setCurrentWorkspace(data?.currentWorkspace);
    }
  }, [setCurrentWorkspace, data, isLoading, loading]);

  return isLoading ? <></> : <>{children}</>;
}
