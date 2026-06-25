import { useCallback } from 'react';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { getLogicFunctionHttpUrl } from '@/settings/logic-functions/utils/getLogicFunctionHttpUrl';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const useGetLogicFunctionHttpUrl = () => {
  const { publicFunctionDomain } = useAtomStateValue(domainConfigurationState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const workspaceSubdomain = currentWorkspace?.subdomain;

  const getHttpUrl = useCallback(
    (path: string) =>
      getLogicFunctionHttpUrl({
        path,
        serverBaseUrl: REACT_APP_SERVER_BASE_URL,
        publicFunctionDomain,
        workspaceSubdomain,
      }),
    [publicFunctionDomain, workspaceSubdomain],
  );

  return {
    getLogicFunctionHttpUrl: getHttpUrl,
    publicFunctionDomain,
    workspaceSubdomain,
  };
};
