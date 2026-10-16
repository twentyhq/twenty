import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useReadDefaultDomainFromConfiguration } from '@/domain-manager/hooks/useReadDefaultDomainFromConfiguration';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

export const useIsCurrentLocationOnAWorkspace = () => {
  const { defaultDomain } = useReadDefaultDomainFromConfiguration();

  const isMultiWorkspaceEnabled = useAtomStateValue(
    isMultiWorkspaceEnabledState,
  );
  const domainConfiguration = useAtomStateValue(domainConfigurationState);

  if (
    isMultiWorkspaceEnabled &&
    (!isDefined(domainConfiguration.frontDomain) ||
      !isDefined(domainConfiguration.defaultSubdomain))
  ) {
    throw new Error(
      doNotTranslate('frontDomain and defaultSubdomain are required'),
    );
  }

  const isOnAWorkspace = !isMultiWorkspaceEnabled
    ? true
    : window.location.hostname !== defaultDomain;

  return {
    isOnAWorkspace,
  };
};
