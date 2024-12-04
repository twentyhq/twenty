import { useRecoilCallback, useRecoilValue } from 'recoil';
import { lastAuthenticateWorkspaceDomainState } from '@/domain-manager/states/lastAuthenticateWorkspaceDomainState';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { isDefined } from '~/utils/isDefined';

export const useLastAuthenticateWorkspaceDomain = () => {
  const domainConfiguration = useRecoilValue(domainConfigurationState);

  const setLastAuthenticateWorkspaceDomain = useRecoilCallback(
    ({ set }) =>
      (params: { id: string; subdomain: string } | null) => {
        set(
          lastAuthenticateWorkspaceDomainState,
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
      },
    [domainConfiguration],
  );

  const lastAuthenticateWorkspaceDomain = useRecoilValue(
    lastAuthenticateWorkspaceDomainState,
  );

  return {
    setLastAuthenticateWorkspaceDomain,
    lastAuthenticateWorkspaceDomain,
  };
};
