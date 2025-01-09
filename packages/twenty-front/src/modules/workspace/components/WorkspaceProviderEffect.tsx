import { useRecoilValue } from 'recoil';

import { useEffect } from 'react';
import { isDefined } from '~/utils/isDefined';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { lastAuthenticatedWorkspaceDomainState } from '@/domain-manager/states/lastAuthenticatedWorkspaceDomainState';
import { useReadWorkspaceSubdomainFromCurrentLocation } from '@/domain-manager/hooks/useReadWorkspaceSubdomainFromCurrentLocation';

import { useIsCurrentLocationOnDefaultDomain } from '@/domain-manager/hooks/useIsCurrentLocationOnDefaultDomain';
import { useGetPublicWorkspaceDataBySubdomain } from '@/domain-manager/hooks/useGetPublicWorkspaceDataBySubdomain';
import { useRedirectToDefaultDomain } from '@/domain-manager/hooks/useRedirectToDefaultDomain';
export const WorkspaceProviderEffect = () => {
  const { data: getPublicWorkspaceData } =
    useGetPublicWorkspaceDataBySubdomain();

  const lastAuthenticatedWorkspaceDomain = useRecoilValue(
    lastAuthenticatedWorkspaceDomainState,
  );

  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const { redirectToDefaultDomain } = useRedirectToDefaultDomain();
  const { isDefaultDomain } = useIsCurrentLocationOnDefaultDomain();

  const { workspaceSubdomain } = useReadWorkspaceSubdomainFromCurrentLocation();

  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);

  const isWorkspaceUseCustomDomain = isDefined(
    getPublicWorkspaceData?.hostname,
  );

  const isWorkspaceDefaultDomainWithLastAuthenticatedParamsExist =
    !isWorkspaceUseCustomDomain &&
    isMultiWorkspaceEnabled &&
    !isDefined(getPublicWorkspaceData?.hostname) &&
    isDefaultDomain &&
    isDefined(lastAuthenticatedWorkspaceDomain) &&
    'subdomain' in lastAuthenticatedWorkspaceDomain &&
    isDefined(lastAuthenticatedWorkspaceDomain?.subdomain);

  const isWorkspaceSubdomainDifferFromCurrentWorkspaceSubdomain =
    !isWorkspaceUseCustomDomain &&
    isMultiWorkspaceEnabled &&
    !isDefined(getPublicWorkspaceData?.hostname) &&
    isDefined(getPublicWorkspaceData?.subdomain) &&
    getPublicWorkspaceData.subdomain !== workspaceSubdomain;

  useEffect(() => {
    if (isWorkspaceSubdomainDifferFromCurrentWorkspaceSubdomain) {
      return redirectToWorkspaceDomain(
        getPublicWorkspaceData.subdomain,
        getPublicWorkspaceData.hostname,
      );
    }

    if (isWorkspaceDefaultDomainWithLastAuthenticatedParamsExist) {
      return redirectToWorkspaceDomain(
        lastAuthenticatedWorkspaceDomain.subdomain,
      );
    }
  }, [
    isWorkspaceUseCustomDomain,
    getPublicWorkspaceData,
    redirectToDefaultDomain,
    isWorkspaceSubdomainDifferFromCurrentWorkspaceSubdomain,
    isWorkspaceDefaultDomainWithLastAuthenticatedParamsExist,
    redirectToWorkspaceDomain,
    lastAuthenticatedWorkspaceDomain,
  ]);

  return <></>;
};
