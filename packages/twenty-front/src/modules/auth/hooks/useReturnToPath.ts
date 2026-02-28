import { useCallback } from 'react';

import { returnToPathState } from '@/auth/states/returnToPathState';
import { isValidReturnToPath } from '@/auth/utils/isValidReturnToPath';
import {
  clearReturnToPathFromSessionStorage,
  readReturnToPathFromSessionStorage,
  writeReturnToPathToSessionStorage,
} from '@/auth/utils/returnToPathSessionStorage';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { isNonEmptyString } from '@sniptt/guards';

export const useReturnToPath = () => {
  const returnToPath = useAtomStateValue(returnToPathState);
  const setReturnToPath = useSetAtomState(returnToPathState);

  const saveReturnToPath = useCallback(
    (path: string) => {
      if (!isValidReturnToPath(path)) {
        return;
      }

      setReturnToPath(path);
      writeReturnToPathToSessionStorage(path);
    },
    [setReturnToPath],
  );

  const getReturnToPath = useCallback((): string | null => {
    if (isNonEmptyString(returnToPath) && isValidReturnToPath(returnToPath)) {
      return returnToPath;
    }

    return readReturnToPathFromSessionStorage();
  }, [returnToPath]);

  const clearReturnToPath = useCallback(() => {
    setReturnToPath('');
    clearReturnToPathFromSessionStorage();
  }, [setReturnToPath]);

  return {
    saveReturnToPath,
    getReturnToPath,
    clearReturnToPath,
  };
};
