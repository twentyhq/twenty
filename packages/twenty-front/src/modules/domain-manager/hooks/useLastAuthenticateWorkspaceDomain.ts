import { lastAuthenticateWorkspaceDomainState } from '@/domain-manager/states/lastAuthenticateWorkspaceDomainState';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { useRecoilValue, useRecoilState } from 'recoil';
import { isDefined } from '~/utils/isDefined';

export const useLastAuthenticateWorkspaceDomain = () => {
  const [lastAuthenticateWorkspaceDomain, setLastAuthenticateWorkspaceDomain] =
    useRecoilState(lastAuthenticateWorkspaceDomainState);

  const domainConfiguration = useRecoilValue(domainConfigurationState);

  const setLastAuthenticateWorkspaceDomainState = (
    params: {
      id: string;
      subdomain: string;
    } | null,
  ) => {
    setLastAuthenticateWorkspaceDomain(
      isDefined(params)
        ? {
            id: params.id,
            subdomain: params.subdomain,
            cookieAttributes: {
              domain: `.${domainConfiguration.frontDomain}`,
            },
          }
        : null,
    );
  };

  return {
    setLastAuthenticateWorkspaceDomain: setLastAuthenticateWorkspaceDomainState,
    lastAuthenticateWorkspaceDomain,
  };
};
