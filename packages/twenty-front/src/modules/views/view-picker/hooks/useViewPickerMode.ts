import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { viewPickerModeComponentState } from '@/views/view-picker/states/viewPickerModeComponentState';

export const useViewPickerMode = (viewBarComponentId?: string) => {
  const [viewPickerMode, setViewPickerMode] = useAtomComponentState(
    viewPickerModeComponentState,
    viewBarComponentId,
  );

  return {
    viewPickerMode,
    setViewPickerMode,
  };
};
