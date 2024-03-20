import { useSetRecoilState } from 'recoil';

import { useViewStates } from '@/views/hooks/internal/useViewStates';

export const useSetRecordCountInCurrentView = (viewBarComponentId?: string) => {
  const { entityCountInCurrentViewState } = useViewStates(viewBarComponentId);

  const setEntityCountInCurrentView = useSetRecoilState(
    entityCountInCurrentViewState,
  );

  return {
    setRecordCountInCurrentView: setEntityCountInCurrentView,
  };
};
