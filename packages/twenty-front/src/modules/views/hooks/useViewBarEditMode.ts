import { useRecoilState } from 'recoil';

import { useViewStates } from '@/views/hooks/internal/useViewStates';

export const useViewBarEditMode = (viewBarComponentId?: string) => {
  const { viewEditModeState } = useViewStates(viewBarComponentId);

  const [viewEditMode, setViewEditMode] = useRecoilState(viewEditModeState);

  return {
    viewEditMode,
    setViewEditMode,
  };
};
