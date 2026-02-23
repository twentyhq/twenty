import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { lastAuthenticatedWorkspaceDomainState } from '@/domain-manager/states/lastAuthenticatedWorkspaceDomainState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';

export const useLastAuthenticatedWorkspaceDomain = () => {
  const domainConfiguration = useRecoilValueV2(domainConfigurationState);
  const setLastAuthenticatedWorkspaceDomain = useSetRecoilStateV2(
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
