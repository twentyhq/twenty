import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useReadDefaultDomainFromConfiguration } from '@/domain-manager/hooks/useReadDefaultDomainFromConfiguration';

export const useIsCurrentLocationOnDefaultDomain = () => {
  const isMultiWorkspaceEnabled = useRecoilValueV2(
    isMultiWorkspaceEnabledState,
  );
  const { defaultDomain } = useReadDefaultDomainFromConfiguration();
  const isDefaultDomain = isMultiWorkspaceEnabled
    ? window.location.hostname === defaultDomain
    : true;

  return {
    isDefaultDomain,
  };
};
