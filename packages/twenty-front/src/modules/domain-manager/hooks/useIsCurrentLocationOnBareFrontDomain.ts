import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsCurrentLocationOnBareFrontDomain = () => {
  const isMultiWorkspaceEnabled = useAtomStateValue(
    isMultiWorkspaceEnabledState,
  );
  const { frontDomain } = useAtomStateValue(domainConfigurationState);

  const isBareFrontDomain =
    isMultiWorkspaceEnabled && window.location.hostname === frontDomain;

  return {
    isBareFrontDomain,
  };
};
