import { isDefined } from '~/utils/isDefined';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { useRecoilValue } from 'recoil';
import { useIsCurrentLocationOnAWorkspaceSubdomain } from '@/domain-manager/hooks/useIsCurrentLocationOnAWorkspaceSubdomain';

export const useReadWorkspaceSubdomainFromCurrentLocation = () => {
  const domainConfiguration = useRecoilValue(domainConfigurationState);
  const { isOnAWorkspaceSubdomain } =
    useIsCurrentLocationOnAWorkspaceSubdomain();

  if (!isDefined(domainConfiguration.frontDomain)) {
    throw new Error('frontDomain is not defined');
  }

  const workspaceSubdomain = isOnAWorkspaceSubdomain
    ? window.location.hostname.replace(
        `.${domainConfiguration.frontDomain}`,
        '',
      )
    : null;

  return {
    workspaceSubdomain,
  };
};
