import { isDefined } from '~/utils/isDefined';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { useRecoilValue } from 'recoil';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useDefaultDomain } from '@/domain-manager/hooks/useDefaultDomain';

export const useWorkspaceSubdomain = () => {
  const domainConfiguration = useRecoilValue(domainConfigurationState);
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  const { defaultDomain } = useDefaultDomain();

  const isWorkspaceSubdomain = () => {
    if (!isMultiWorkspaceEnabled) return false;

    if (
      !isDefined(domainConfiguration.frontDomain) ||
      !isDefined(domainConfiguration.defaultSubdomain)
    ) {
      throw new Error('frontDomain and defaultSubdomain are required');
    }

    return window.location.hostname !== defaultDomain;
  };

  const workspaceSubdomain = () => {
    if (!isDefined(domainConfiguration.frontDomain)) {
      throw new Error('frontDomain is not defined');
    }

    return isWorkspaceSubdomain()
      ? window.location.hostname.replace(
          `.${domainConfiguration.frontDomain}`,
          '',
        )
      : null;
  };

  return {
    workspaceSubdomain,
    isWorkspaceSubdomain,
  };
};
