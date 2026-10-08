import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { buildServerUrl } from '@/settings/security/utils/buildServerUrl';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const useBuildServerUrl = () => {
  const { serverUrl } = useAtomStateValue(domainConfigurationState);

  const baseUrl = isNonEmptyString(serverUrl)
    ? serverUrl
    : REACT_APP_SERVER_BASE_URL;

  return (pathname: string) => buildServerUrl({ serverUrl: baseUrl, pathname });
};
