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
    onError: () => {
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

  return <></>;
};
