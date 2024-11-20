import { useRecoilValue, useSetRecoilState } from 'recoil';

import { useGetPublicWorkspaceDataBySubdomainQuery } from '~/generated/graphql';

import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { useEffect } from 'react';
import { isDefined } from '~/utils/isDefined';

export const WorkspaceProviderEffect = () => {
  const workspacePublicData = useRecoilValue(workspacePublicDataState);

  const setAuthProviders = useSetRecoilState(authProvidersState);
  const setWorkspacePublicDataState = useSetRecoilState(
    workspacePublicDataState,
  );

  useGetPublicWorkspaceDataBySubdomainQuery({
    onCompleted: (data) => {
      setAuthProviders(data.getPublicWorkspaceDataBySubdomain.authProviders);
      setWorkspacePublicDataState(data.getPublicWorkspaceDataBySubdomain);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  useEffect(() => {
    try {
      if (isDefined(workspacePublicData?.logo)) {
        const link: HTMLLinkElement =
          document.querySelector("link[rel*='icon']") ||
          document.createElement('link');
        link.rel = 'icon';
        link.href = workspacePublicData.logo;
        document.getElementsByTagName('head')[0].appendChild(link);
      }
    } catch (err) {
      console.error(err);
    }
  }, [workspacePublicData]);

  return <></>;
};
