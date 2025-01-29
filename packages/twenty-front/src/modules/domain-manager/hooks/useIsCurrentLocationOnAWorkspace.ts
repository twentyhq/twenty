import { isDefined } from '~/utils/isDefined';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useRecoilValue } from 'recoil';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { useReadDefaultDomainFromConfiguration } from '@/domain-manager/hooks/useReadDefaultDomainFromConfiguration';

export const useIsCurrentLocationOnAWorkspace = () => {
  const { defaultDomain } = useReadDefaultDomainFromConfiguration();

  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  const domainConfiguration = useRecoilValue(domainConfigurationState);

  if (
    isMultiWorkspaceEnabled &&
    (!isDefined(domainConfiguration.frontDomain) ||
      !isDefined(domainConfiguration.defaultSubdomain))
  ) {
    throw new Error('frontDomain and defaultSubdomain are required');
  }

  const isOnAWorkspace =
    isMultiWorkspaceEnabled && window.location.hostname !== defaultDomain;

  return {
    isOnAWorkspace,
  };
};
