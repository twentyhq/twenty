import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useIsCurrentLocationOnDefaultDomain } from '@/domain-manager/hooks/useIsCurrentLocationOnDefaultDomain';
import { useOrigin } from '@/domain-manager/hooks/useOrigin';
import { useRedirectToDefaultDomain } from '@/domain-manager/hooks/useRedirectToDefaultDomain';
import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import { workspaceAuthBypassProvidersState } from '@/workspace/states/workspaceAuthBypassProvidersState';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useGetPublicWorkspaceDataByDomainQuery } from '~/generated-metadata/graphql';

export const useGetPublicWorkspaceDataByDomain = () => {
  const { isDefaultDomain } = useIsCurrentLocationOnDefaultDomain();
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  const { origin } = useOrigin();
  const setWorkspaceAuthProviders = useSetRecoilState(
    workspaceAuthProvidersState,
  );
  const setWorkspaceAuthBypassProviders = useSetRecoilState(
    workspaceAuthBypassProvidersState,
  );
  const workspacePublicData = useRecoilValue(workspacePublicDataState);
  const { redirectToDefaultDomain } = useRedirectToDefaultDomain();
  const setWorkspacePublicDataState = useSetRecoilState(
    workspacePublicDataState,
  );
  const clientConfigApiStatus = useRecoilValue(clientConfigApiStatusState);

  const { loading, data, error } = useGetPublicWorkspaceDataByDomainQuery({
    variables: {
      origin,
    },
    skip:
      !clientConfigApiStatus.isSaved ||
      (isMultiWorkspaceEnabled && isDefaultDomain) ||
      isDefined(workspacePublicData),
    onCompleted: (data) => {
      setWorkspaceAuthProviders(
        data.getPublicWorkspaceDataByDomain.authProviders,
      );
      setWorkspaceAuthBypassProviders(
        data.getPublicWorkspaceDataByDomain.authBypassProviders ?? null,
      );
      setWorkspacePublicDataState(data.getPublicWorkspaceDataByDomain);
    },
    onError: (error) => {
      // Only redirect to default domain if it's a workspace not found error
      const isWorkspaceNotFoundError = error.graphQLErrors?.some(
        (graphQLError) => graphQLError.extensions?.code === 'NOT_FOUND',
      );

      if (isWorkspaceNotFoundError) {
        redirectToDefaultDomain();
      } else {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    },
  });

  return {
    loading,
    data: data?.getPublicWorkspaceDataByDomain,
    error,
  };
};
