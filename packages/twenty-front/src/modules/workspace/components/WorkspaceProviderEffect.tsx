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
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';

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

  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);

  useGetPublicWorkspaceDataBySubdomainQuery({
    onCompleted: (data) => {
      setAuthProviders(data.getPublicWorkspaceDataBySubdomain.authProviders);
      setWorkspacePublicDataState(data.getPublicWorkspaceDataBySubdomain);
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error(error);
      setLastAuthenticateWorkspaceState(null);
      redirectToHome();
    },
  });

  useEffect(() => {
    if (
      isMultiWorkspaceEnabled &&
      isDefined(workspacePublicData?.subdomain) &&
      workspacePublicData.subdomain !== getWorkspaceSubdomain()
    ) {
      redirectToWorkspace(workspacePublicData.subdomain);
    }
  }, [workspacePublicData]);

  useEffect(() => {
    if (
      isMultiWorkspaceEnabled &&
      isDefined(lastAuthenticateWorkspace?.subdomain) &&
      isTwentyHomePage
    ) {
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
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }, [workspacePublicData]);

  return <></>;
};
