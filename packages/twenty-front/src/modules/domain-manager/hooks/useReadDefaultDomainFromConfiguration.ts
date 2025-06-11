import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { useRecoilValue } from 'recoil';

export const useReadDefaultDomainFromConfiguration = () => {
  const domainConfiguration = useRecoilValue(domainConfigurationState);
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);

  const defaultDomain = isMultiWorkspaceEnabled
    ? `${domainConfiguration.defaultSubdomain}.${domainConfiguration.frontDomain}`
    : domainConfiguration.frontDomain;

  return {
    defaultDomain,
  };
};
