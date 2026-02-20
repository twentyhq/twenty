import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export const useReadDefaultDomainFromConfiguration = () => {
  const domainConfiguration = useRecoilValueV2(domainConfigurationState);
  const isMultiWorkspaceEnabled = useRecoilValueV2(
    isMultiWorkspaceEnabledState,
  );

  const defaultDomain = isMultiWorkspaceEnabled
    ? `${domainConfiguration.defaultSubdomain}.${domainConfiguration.frontDomain}`
    : domainConfiguration.frontDomain;

  return {
    defaultDomain,
  };
};
