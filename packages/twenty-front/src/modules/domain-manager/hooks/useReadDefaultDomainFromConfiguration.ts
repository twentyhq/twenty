import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';

export const useReadDefaultDomainFromConfiguration = () => {
  const domainConfiguration = useAtomValue(domainConfigurationState);
  const isMultiWorkspaceEnabled = useAtomValue(isMultiWorkspaceEnabledState);

  const defaultDomain = isMultiWorkspaceEnabled
    ? `${domainConfiguration.defaultSubdomain}.${domainConfiguration.frontDomain}`
    : domainConfiguration.frontDomain;

  return {
    defaultDomain,
  };
};
