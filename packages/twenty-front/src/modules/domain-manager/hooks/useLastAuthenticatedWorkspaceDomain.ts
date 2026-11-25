import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { lastAuthenticatedWorkspaceDomainState } from '@/domain-manager/states/lastAuthenticatedWorkspaceDomainState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useLastAuthenticatedWorkspaceDomain = () => {
  const domainConfiguration = useAtomStateValue(domainConfigurationState);
  const setLastAuthenticatedWorkspaceDomain = useSetAtomState(
    lastAuthenticatedWorkspaceDomainState,
  );
  const setLastAuthenticateWorkspaceDomainWithCookieAttributes = useCallback(
    (params: { workspaceId: string; workspaceUrl: string } | null) => {
      setLastAuthenticatedWorkspaceDomain({
        ...(isDefined(params) ? params : {}),
        cookieAttributes: {
          domain: `.${domainConfiguration.frontDomain}`,
        },
      });
    },
    [setLastAuthenticatedWorkspaceDomain, domainConfiguration.frontDomain],
  );

  return {
    setLastAuthenticateWorkspaceDomain:
      setLastAuthenticateWorkspaceDomainWithCookieAttributes,
  };
};
