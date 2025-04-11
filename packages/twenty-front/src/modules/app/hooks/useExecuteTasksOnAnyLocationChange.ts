import { useInitializeUrlStates } from '@/app/hooks/useInitializeUrlStates';
import { useCloseAnyOpenDropdown } from '@/ui/layout/dropdown/hooks/useCloseAnyOpenDropdown';

export const useExecuteTasksOnAnyLocationChange = () => {
  useInitializeUrlStates();

  const { closeAnyOpenDropdown } = useCloseAnyOpenDropdown();
  const { initializeUrlStates } = useInitializeUrlStates();

  /**
   * Be careful to put idempotent tasks here.
   *
   * Because it might be called multiple times.
   */
  const executeTasksOnAnyLocationChange = () => {
    closeAnyOpenDropdown();
    initializeUrlStates();
  };

  return { executeTasksOnAnyLocationChange };
};
