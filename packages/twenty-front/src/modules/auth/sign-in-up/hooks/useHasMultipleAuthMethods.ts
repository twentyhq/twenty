import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import { useRecoilValue } from 'recoil';

export const useHasMultipleAuthMethods = () => {
  const workspaceAuthProviders = useRecoilValue(workspaceAuthProvidersState);

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
