import { useCopyContextStoreStates } from '@/command-menu/hooks/useCopyContextStoreAndActionMenuStates';
import { useResetContextStoreStates } from '@/command-menu/hooks/useResetContextStoreStates';

export const useResetPreviousCommandMenuContext = () => {
  const { copyContextStoreStates } = useCopyContextStoreStates();
  const { resetContextStoreStates } = useResetContextStoreStates();

  const resetPreviousCommandMenuContext = () => {
    copyContextStoreStates({
      instanceIdToCopyFrom: 'command-menu-previous',
      instanceIdToCopyTo: 'command-menu',
    });
    resetContextStoreStates('command-menu-previous');
  };

  return {
    resetPreviousCommandMenuContext,
  };
};
