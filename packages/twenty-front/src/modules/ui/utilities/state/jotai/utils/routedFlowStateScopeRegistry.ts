import { isDefined } from 'twenty-shared/utils';

const releaseCallbacks = new Set<(scopeId: string) => void>();
const ownersByScope = new Map<string, Set<symbol>>();
const pendingReleases = new Set<string>();

const releaseUnownedScope = (scopeId: string) => {
  if (ownersByScope.has(scopeId) || !pendingReleases.has(scopeId)) {
    return;
  }

  pendingReleases.delete(scopeId);
  for (const callback of releaseCallbacks) {
    callback(scopeId);
  }
};

export const routedFlowStateScopeRegistry = {
  registerRelease: (callback: (scopeId: string) => void) => {
    releaseCallbacks.add(callback);
  },
  retain: (scopeId: string) => {
    const owner = Symbol();
    const owners = ownersByScope.get(scopeId) ?? new Set<symbol>();
    owners.add(owner);
    ownersByScope.set(scopeId, owners);

    return () => {
      const currentOwners = ownersByScope.get(scopeId);
      if (!isDefined(currentOwners) || !currentOwners.delete(owner)) {
        return;
      }
      if (currentOwners.size > 0) {
        return;
      }

      ownersByScope.delete(scopeId);
      queueMicrotask(() => releaseUnownedScope(scopeId));
    };
  },
  release: (scopeId: string) => {
    pendingReleases.add(scopeId);
    releaseUnownedScope(scopeId);
  },
};
