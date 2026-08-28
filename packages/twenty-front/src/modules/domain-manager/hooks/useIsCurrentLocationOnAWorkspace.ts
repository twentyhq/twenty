import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { isMultiWorkspaceSubdomainEnabledState } from '@/client-config/states/isMultiWorkspaceSubdomainEnabledState';
import { useReadDefaultDomainFromConfiguration } from '@/domain-manager/hooks/useReadDefaultDomainFromConfiguration';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useIsCurrentLocationOnAWorkspace = () => {
  const { defaultDomain } = useReadDefaultDomainFromConfiguration();

  const isMultiWorkspaceEnabled = useAtomStateValue(
    isMultiWorkspaceEnabledState,
  );
  const isMultiWorkspaceSubdomainEnabled = useAtomStateValue(
    isMultiWorkspaceSubdomainEnabledState,
  );
  const domainConfiguration = useAtomStateValue(domainConfigurationState);

  if (
    isMultiWorkspaceEnabled &&
    isMultiWorkspaceSubdomainEnabled &&
    (!isDefined(domainConfiguration.frontDomain) ||
      !isDefined(domainConfiguration.defaultSubdomain))
  ) {
    throw new Error('frontDomain and defaultSubdomain are required');
  }

  const isOnAWorkspace =
    !isMultiWorkspaceEnabled || !isMultiWorkspaceSubdomainEnabled
      ? true
      : window.location.hostname !== defaultDomain;

  return {
    isOnAWorkspace,
  };
};
