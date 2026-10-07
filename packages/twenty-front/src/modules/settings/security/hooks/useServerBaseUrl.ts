import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const useServerBaseUrl = () => {
  const { serverUrl } = useAtomStateValue(domainConfigurationState);

  const baseUrl = isNonEmptyString(serverUrl)
    ? serverUrl
    : REACT_APP_SERVER_BASE_URL;

  return baseUrl.replace(/\/$/, '');
};
