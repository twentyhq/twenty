import { useRecoilCallback } from 'recoil';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
import { useCloseAnyOpenDropdown } from '@/ui/layout/dropdown/hooks/useCloseAnyOpenDropdown';

export const useExecuteTasksOnAnyLocationChange = () => {
  const { closeAnyOpenDropdown } = useCloseAnyOpenDropdown();

  const resetIsPageInEditMode = useRecoilCallback(
    ({ set }) =>
      () => {
        set(
          contextStoreIsPageInEditModeComponentState.atomFamily({
            instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
          }),
          false,
        );
      },
    [],
  );

  /**
   * Be careful to put idempotent tasks here.
   *
   * Because it might be called multiple times.
   */
  const executeTasksOnAnyLocationChange = () => {
    closeAnyOpenDropdown();
    resetIsPageInEditMode();
  };

  return { executeTasksOnAnyLocationChange };
};
