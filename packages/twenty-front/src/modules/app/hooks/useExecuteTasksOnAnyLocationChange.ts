import { useCloseAnyOpenDropdown } from '@/ui/layout/dropdown/hooks/useCloseAnyOpenDropdown';

export const useExecuteTasksOnAnyLocationChange = () => {
  const { closeAnyOpenDropdown } = useCloseAnyOpenDropdown();

  /**
   * Be careful to put idempotent tasks here.
   *
   * Because it might be called multiple times.
   */
  const executeTasksOnAnyLocationChange = () => {
    closeAnyOpenDropdown();
  };

  return { executeTasksOnAnyLocationChange };
};
