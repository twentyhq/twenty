import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import { useGetHostnameDetailsQuery } from '~/generated/graphql';

export const SettingsHostnameEffect = () => {
  const { refetch } = useGetHostnameDetailsQuery();

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  useEffect(() => {
    let pollIntervalFn: null | ReturnType<typeof setInterval> = null;
    if (isDefined(currentWorkspace?.hostname)) {
      pollIntervalFn = setInterval(async () => {
        refetch();
      }, 3000);
    }

    return () => {
      if (isDefined(pollIntervalFn)) {
        clearInterval(pollIntervalFn);
      }
    };
  }, [currentWorkspace?.hostname, refetch]);

  return <></>;
};
