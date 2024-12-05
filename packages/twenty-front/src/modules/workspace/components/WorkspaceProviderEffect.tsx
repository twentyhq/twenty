import { useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil';

import { useGetPublicWorkspaceDataBySubdomainQuery } from '~/generated/graphql';

import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { useEffect } from 'react';
import { isDefined } from '~/utils/isDefined';
import { lastAuthenticateWorkspaceState } from '@/auth/states/lastAuthenticateWorkspaceState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useUrlManager } from '@/url-manager/hooks/useUrlManager';

export const WorkspaceProviderEffect = () => {
  const workspacePublicData = useRecoilValue(workspacePublicDataState);

  const setAuthProviders = useSetRecoilState(authProvidersState);
  const setWorkspacePublicDataState = useSetRecoilState(
    workspacePublicDataState,
  );

  const [lastAuthenticateWorkspace, setLastAuthenticateWorkspace] =
    useRecoilState(lastAuthenticateWorkspaceState);

  const {
    redirectToHome,
    getWorkspaceSubdomain,
    redirectToWorkspace,
    isTwentyHomePage,
  } = useUrlManager();

  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);

  useGetPublicWorkspaceDataBySubdomainQuery({
    skip:
      (isMultiWorkspaceEnabled && isTwentyHomePage) ||
      isDefined(workspacePublicData),
    onCompleted: (data) => {
      setAuthProviders(data.getPublicWorkspaceDataBySubdomain.authProviders);
      setWorkspacePublicDataState(data.getPublicWorkspaceDataBySubdomain);
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error(error);
      setLastAuthenticateWorkspace(null);
      redirectToHome();
    },
  });

  useEffect(() => {
    if (
      isMultiWorkspaceEnabled &&
      isDefined(workspacePublicData?.subdomain) &&
      workspacePublicData.subdomain !== getWorkspaceSubdomain
    ) {
      redirectToWorkspace(workspacePublicData.subdomain);
    }
  }, [
    getWorkspaceSubdomain,
    isMultiWorkspaceEnabled,
    redirectToWorkspace,
    workspacePublicData,
  ]);

  useEffect(() => {
    if (
      isMultiWorkspaceEnabled &&
      isDefined(lastAuthenticateWorkspace?.subdomain) &&
      isTwentyHomePage
    ) {
      redirectToWorkspace(lastAuthenticateWorkspace.subdomain);
    }
  }, [
    isMultiWorkspaceEnabled,
    isTwentyHomePage,
    lastAuthenticateWorkspace,
    redirectToWorkspace,
  ]);

  return <></>;
};
