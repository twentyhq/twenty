import { useGetPublicWorkspaceDataBySubdomainQuery } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useRedirectToDefaultDomain } from '@/domain-manager/hooks/useRedirectToDefaultDomain';
import { useLastAuthenticatedWorkspaceDomain } from '@/domain-manager/hooks/useLastAuthenticatedWorkspaceDomain';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useIsCurrentLocationOnDefaultDomain } from '@/domain-manager/hooks/useIsCurrentLocationOnDefaultDomain';

export const useGetPublicWorkspaceDataBySubdomain = () => {
  const { isDefaultDomain } = useIsCurrentLocationOnDefaultDomain();
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  const setAuthProviders = useSetRecoilState(authProvidersState);
  const workspacePublicData = useRecoilValue(workspacePublicDataState);
  const { redirectToDefaultDomain } = useRedirectToDefaultDomain();
  const setWorkspacePublicDataState = useSetRecoilState(
    workspacePublicDataState,
  );
  const { setLastAuthenticateWorkspaceDomain } =
    useLastAuthenticatedWorkspaceDomain();

  const { loading } = useGetPublicWorkspaceDataBySubdomainQuery({
    skip:
      (isMultiWorkspaceEnabled && isDefaultDomain) ||
      isDefined(workspacePublicData),
    onCompleted: (data) => {
      setAuthProviders(data.getPublicWorkspaceDataBySubdomain.authProviders);
      setWorkspacePublicDataState(data.getPublicWorkspaceDataBySubdomain);
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error(error);
      setLastAuthenticateWorkspaceDomain(null);
      redirectToDefaultDomain();
    },
  });

  return {
    loading,
  };
};
