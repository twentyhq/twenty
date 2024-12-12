import { useRecoilValue, useSetRecoilState } from 'recoil';
import { lastAuthenticatedWorkspaceDomainState } from '@/domain-manager/states/lastAuthenticatedWorkspaceDomainState';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';

export const useLastAuthenticatedWorkspaceDomain = () => {
  const domainConfiguration = useRecoilValue(domainConfigurationState);
  const setLastAuthenticatedWorkspaceDomain = useSetRecoilState(
    lastAuthenticatedWorkspaceDomainState,
  );
  const setLastAuthenticateWorkspaceDomainWithCookieAttributes = (
    params: { workspaceId: string; subdomain: string } | null,
  ) => {
    setLastAuthenticatedWorkspaceDomain({
      ...(params ? params : {}),
      cookieAttributes: {
        domain: `.${domainConfiguration.frontDomain}`,
      },
    });
  };

  return {
    setLastAuthenticateWorkspaceDomain:
      setLastAuthenticateWorkspaceDomainWithCookieAttributes,
  };
};
