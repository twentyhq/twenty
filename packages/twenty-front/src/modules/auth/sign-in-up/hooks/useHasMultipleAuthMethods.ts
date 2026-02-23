import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export const useHasMultipleAuthMethods = () => {
  const workspaceAuthProviders = useRecoilValueV2(workspaceAuthProvidersState);

  if (!workspaceAuthProviders) {
    return false;
  }

  let enabledMethodsCount = 0;

  if (workspaceAuthProviders.google) enabledMethodsCount++;
  if (workspaceAuthProviders.microsoft) enabledMethodsCount++;
  if (workspaceAuthProviders.password) enabledMethodsCount++;
  if (workspaceAuthProviders.sso.length > 0) enabledMethodsCount++;

  return enabledMethodsCount > 1;
};
