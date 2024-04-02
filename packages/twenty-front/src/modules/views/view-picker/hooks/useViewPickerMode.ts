import { useRecoilState } from 'recoil';

import { useViewPickerStates } from '@/views/view-picker/hooks/useViewPickerStates';

export const useViewPickerMode = (viewBarComponentId?: string) => {
  const { viewPickerModeState } = useViewPickerStates(viewBarComponentId);

  const [viewPickerMode, setViewPickerMode] =
    useRecoilState(viewPickerModeState);

  return {
    viewPickerMode,
    setViewPickerMode,
  };
};
