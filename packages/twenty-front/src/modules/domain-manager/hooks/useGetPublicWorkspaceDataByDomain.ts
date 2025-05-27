import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useIsCurrentLocationOnDefaultDomain } from '@/domain-manager/hooks/useIsCurrentLocationOnDefaultDomain';
import { useOrigin } from '@/domain-manager/hooks/useOrigin';
import { useRedirectToDefaultDomain } from '@/domain-manager/hooks/useRedirectToDefaultDomain';
import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useGetPublicWorkspaceDataByDomainQuery } from '~/generated/graphql';
import { isDefined } from 'twenty-shared/utils';

export const useGetPublicWorkspaceDataByDomain = () => {
  const { isDefaultDomain } = useIsCurrentLocationOnDefaultDomain();
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  const { origin } = useOrigin();
  const setWorkspaceAuthProviders = useSetRecoilState(
    workspaceAuthProvidersState,
  );
  const workspacePublicData = useRecoilValue(workspacePublicDataState);
  const { redirectToDefaultDomain } = useRedirectToDefaultDomain();
  const setWorkspacePublicDataState = useSetRecoilState(
    workspacePublicDataState,
  );

  const { loading, data, error } = useGetPublicWorkspaceDataByDomainQuery({
    variables: {
      origin,
    },
    skip:
      (isMultiWorkspaceEnabled && isDefaultDomain) ||
      isDefined(workspacePublicData),
    onCompleted: (data) => {
      setWorkspaceAuthProviders(
        data.getPublicWorkspaceDataByDomain.authProviders,
      );
      setWorkspacePublicDataState(data.getPublicWorkspaceDataByDomain);
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error(error);
      redirectToDefaultDomain();
    },
  });

  return {
    loading,
    data: data?.getPublicWorkspaceDataByDomain,
    error,
  };
};
