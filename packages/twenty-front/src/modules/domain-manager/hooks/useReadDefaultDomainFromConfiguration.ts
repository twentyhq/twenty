import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { isMultiWorkspaceSubdomainEnabledState } from '@/client-config/states/isMultiWorkspaceSubdomainEnabledState';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useReadDefaultDomainFromConfiguration = () => {
  const domainConfiguration = useAtomStateValue(domainConfigurationState);
  const isMultiWorkspaceEnabled = useAtomStateValue(
    isMultiWorkspaceEnabledState,
  );
  const isMultiWorkspaceSubdomainEnabled = useAtomStateValue(
    isMultiWorkspaceSubdomainEnabledState,
  );

  const defaultDomain =
    isMultiWorkspaceEnabled && isMultiWorkspaceSubdomainEnabled
      ? `${domainConfiguration.defaultSubdomain}.${domainConfiguration.frontDomain}`
      : domainConfiguration.frontDomain;

  return {
    defaultDomain,
  };
};
