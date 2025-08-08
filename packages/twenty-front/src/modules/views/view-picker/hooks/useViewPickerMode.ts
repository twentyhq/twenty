import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { viewPickerModeComponentState } from '@/views/view-picker/states/viewPickerModeComponentState';

export const useViewPickerMode = (viewBarComponentId?: string) => {
  const [viewPickerMode, setViewPickerMode] = useRecoilComponentState(
    viewPickerModeComponentState,
    viewBarComponentId,
  );

  return {
    viewPickerMode,
    setViewPickerMode,
  };
};
