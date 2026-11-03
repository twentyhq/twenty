import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { getUrlSafely } from 'twenty-shared/utils';

export const useIsCurrentLocationOnAdminConsole = () => {
  const { adminConsoleUrl } = useAtomStateValue(domainConfigurationState);

  const isOnAdminConsole =
    isNonEmptyString(adminConsoleUrl) &&
    getUrlSafely(adminConsoleUrl)?.host === window.location.host;

  return { isOnAdminConsole };
};
