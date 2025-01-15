import { useCallback } from 'react';
import { useRecoilCallback } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { isDefined } from '~/utils/isDefined';

import { SnackBarManagerScopeInternalContext } from '@/ui/feedback/snack-bar-manager/scopes/scope-internal-context/SnackBarManagerScopeInternalContext';
import {
  snackBarInternalScopedState,
  SnackBarOptions,
} from '@/ui/feedback/snack-bar-manager/states/snackBarInternalScopedState';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

export const useSnackBar = () => {
  const scopeId = useAvailableScopeIdOrThrow(
    SnackBarManagerScopeInternalContext,
  );

  const handleSnackBarClose = useRecoilCallback(
    ({ set }) =>
      (id: string) => {
        set(snackBarInternalScopedState({ scopeId }), (prevState) => ({
          ...prevState,
          queue: prevState.queue.filter((snackBar) => snackBar.id !== id),
        }));
      },
    [scopeId],
  );

  const setSnackBarQueue = useRecoilCallback(
    ({ set }) =>
      (newValue: SnackBarOptions) =>
        set(snackBarInternalScopedState({ scopeId }), (prev) => {
          if (
            isDefined(newValue.dedupeKey) &&
            prev.queue.some(
              (snackBar) => snackBar.dedupeKey === newValue.dedupeKey,
            )
          ) {
            return prev;
          }

          if (prev.queue.length >= prev.maxQueue) {
            return {
              ...prev,
              queue: [...prev.queue.slice(1), newValue] as SnackBarOptions[],
            };
          }

          return {
            ...prev,
            queue: [...prev.queue, newValue] as SnackBarOptions[],
          };
        }),
    [scopeId],
  );

  const enqueueSnackBar = useCallback(
    (message: string, options?: Omit<SnackBarOptions, 'message' | 'id'>) => {
      setSnackBarQueue({
        id: uuidv4(),
        message,
        ...options,
      });
    },
    [setSnackBarQueue],
  );

  return { handleSnackBarClose, enqueueSnackBar };
};
