import { useCallback } from 'react';

import { returnToPathState } from '@/auth/states/returnToPathState';
import { isValidReturnToPath } from '@/auth/utils/isValidReturnToPath';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';

export const useReturnToPath = () => {
  const store = useStore();
  const setReturnToPath = useSetAtomState(returnToPathState);

  const saveReturnToPath = useCallback(
    (path: string) => {
      if (!isValidReturnToPath(path)) {
        return;
      }

      setReturnToPath(path);
    },
    [setReturnToPath],
  );

  const getReturnToPath = useCallback((): string | null => {
    const currentReturnToPath = store.get(returnToPathState.atom);

    if (
      isNonEmptyString(currentReturnToPath) &&
      isValidReturnToPath(currentReturnToPath)
    ) {
      return currentReturnToPath;
    }

    return null;
  }, [store]);

  const clearReturnToPath = useCallback(() => {
    setReturnToPath('');
  }, [setReturnToPath]);

  return {
    saveReturnToPath,
    getReturnToPath,
    clearReturnToPath,
  };
};
