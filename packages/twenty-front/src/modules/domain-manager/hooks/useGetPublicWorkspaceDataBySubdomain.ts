import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useIsCurrentLocationOnDefaultDomain } from '@/domain-manager/hooks/useIsCurrentLocationOnDefaultDomain';
import { useLastAuthenticatedWorkspaceDomain } from '@/domain-manager/hooks/useLastAuthenticatedWorkspaceDomain';
import { useRedirectToDefaultDomain } from '@/domain-manager/hooks/useRedirectToDefaultDomain';
import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useGetPublicWorkspaceDataBySubdomainQuery } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

export const useGetPublicWorkspaceDataBySubdomain = () => {
  const { isDefaultDomain } = useIsCurrentLocationOnDefaultDomain();
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  const setWorkspaceAuthProviders = useSetRecoilState(
    workspaceAuthProvidersState,
  );
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
      setWorkspaceAuthProviders(
        data.getPublicWorkspaceDataBySubdomain.authProviders,
      );
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
