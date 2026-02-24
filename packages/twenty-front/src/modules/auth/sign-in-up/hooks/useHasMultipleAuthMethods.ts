import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';

export const useHasMultipleAuthMethods = () => {
  const workspaceAuthProviders = useAtomValue(workspaceAuthProvidersState);

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
