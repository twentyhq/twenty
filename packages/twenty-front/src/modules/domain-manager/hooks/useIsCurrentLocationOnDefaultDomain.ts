import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';
import { useReadDefaultDomainFromConfiguration } from '@/domain-manager/hooks/useReadDefaultDomainFromConfiguration';

export const useIsCurrentLocationOnDefaultDomain = () => {
  const isMultiWorkspaceEnabled = useAtomValue(isMultiWorkspaceEnabledState);
  const { defaultDomain } = useReadDefaultDomainFromConfiguration();
  const isDefaultDomain = isMultiWorkspaceEnabled
    ? window.location.hostname === defaultDomain
    : true;

  return {
    isDefaultDomain,
  };
};
