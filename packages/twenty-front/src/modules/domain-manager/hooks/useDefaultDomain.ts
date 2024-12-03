import { domainConfigurationState } from '@/domain-manager/states/domain-configuration.state';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useRecoilValue } from 'recoil';

export const useDefaultDomain = () => {
  const domainConfiguration = useRecoilValue(domainConfigurationState);
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);

  const defaultDomain = isMultiWorkspaceEnabled
    ? `${domainConfiguration.defaultSubdomain}.${domainConfiguration.frontDomain}`
    : domainConfiguration.frontDomain;

  const isDefaultDomain = isMultiWorkspaceEnabled
    ? window.location.hostname === defaultDomain
    : true;

  return {
    defaultDomain,
    isDefaultDomain,
  };
};
