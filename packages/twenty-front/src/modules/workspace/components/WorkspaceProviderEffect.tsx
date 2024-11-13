import { useRecoilValue, useSetRecoilState } from 'recoil';

import { useGetPublicWorkspaceDataBySubdomainQuery } from '~/generated/graphql';
import {
  getWorkspaceSubdomain,
  isTwentyHomePage,
  redirectToHome,
  redirectToWorkspace,
} from '~/utils/workspace-url.helper';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { useEffect } from 'react';
import { isDefined } from '~/utils/isDefined';
import { lastAuthenticateWorkspaceState } from '@/auth/states/lastAuthenticateWorkspaceState';

export const WorkspaceProviderEffect = () => {
  const workspacePublicData = useRecoilValue(workspacePublicDataState);

  const setAuthProviders = useSetRecoilState(authProvidersState);
  const setWorkspacePublicDataState = useSetRecoilState(
    workspacePublicDataState,
  );

  const setLastAuthenticateWorkspaceState = useSetRecoilState(
    lastAuthenticateWorkspaceState,
  );
  const lastAuthenticateWorkspace = useRecoilValue(
    lastAuthenticateWorkspaceState,
  );

  useGetPublicWorkspaceDataBySubdomainQuery({
    onCompleted: (data) => {
      setAuthProviders(data.getPublicWorkspaceDataBySubdomain.authProviders);
      setWorkspacePublicDataState(data.getPublicWorkspaceDataBySubdomain);
    },
    onError: (error) => {
      console.error(error);
      setLastAuthenticateWorkspaceState(null);
      redirectToHome();
    },
  });

  useEffect(() => {
    if (
      isDefined(workspacePublicData?.subdomain) &&
      workspacePublicData.subdomain !== getWorkspaceSubdomain()
    ) {
      redirectToWorkspace(workspacePublicData.subdomain);
    }
  }, [workspacePublicData]);

  useEffect(() => {
    if (isDefined(lastAuthenticateWorkspace) && isTwentyHomePage) {
      redirectToWorkspace(lastAuthenticateWorkspace.subdomain);
    }
  }, [lastAuthenticateWorkspace]);

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
