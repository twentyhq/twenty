import { useRecoilInstanceState } from '@/ui/utilities/state/instance/hooks/useRecoilInstanceState';
import { viewPickerModeInstanceState } from '@/views/view-picker/states/viewPickerModeInstanceState';

export const useViewPickerMode = (viewBarComponentId?: string) => {
  const [viewPickerMode, setViewPickerMode] = useRecoilInstanceState(
    viewPickerModeInstanceState,
    viewBarComponentId,
  );

  return {
    viewPickerMode,
    setViewPickerMode,
  };
};
