import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { lastAuthenticatedWorkspaceDomainState } from '@/domain-manager/states/lastAuthenticatedWorkspaceDomainState';
import { useRecoilValue, useSetRecoilState } from 'recoil';

export const useLastAuthenticatedWorkspaceDomain = () => {
  const domainConfiguration = useRecoilValue(domainConfigurationState);
  const setLastAuthenticatedWorkspaceDomain = useSetRecoilState(
    lastAuthenticatedWorkspaceDomainState,
  );
  const setLastAuthenticateWorkspaceDomainWithCookieAttributes = (
    params: { workspaceId: string; workspaceUrl: string } | null,
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
