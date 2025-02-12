import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import { useGetCustomDomainDetailsQuery } from '~/generated/graphql';

export const SettingsCustomDomainEffect = () => {
  const { refetch } = useGetCustomDomainDetailsQuery();

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  useEffect(() => {
    let pollIntervalFn: null | ReturnType<typeof setInterval> = null;
    if (isDefined(currentWorkspace?.customDomain)) {
      pollIntervalFn = setInterval(async () => {
        refetch();
      }, 3000);
    }

    return () => {
      if (isDefined(pollIntervalFn)) {
        clearInterval(pollIntervalFn);
      }
    };
  }, [currentWorkspace?.customDomain, refetch]);

  return <></>;
};
