import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { lastAuthenticatedWorkspaceDomainState } from '@/domain-manager/states/lastAuthenticatedWorkspaceDomainState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useLastAuthenticatedWorkspaceDomain = () => {
  const domainConfiguration = useAtomValue(domainConfigurationState);
  const setLastAuthenticatedWorkspaceDomain = useSetAtomState(
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
