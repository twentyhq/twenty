import { useSetRecoilInstanceState } from '@/ui/utilities/state/instance/hooks/useSetRecoilInstanceState';
import { entityCountInCurrentViewInstanceState } from '@/views/states/entityCountInCurrentViewInstanceState';

export const useSetRecordCountInCurrentView = (viewBarComponentId?: string) => {
  const setEntityCountInCurrentView = useSetRecoilInstanceState(
    entityCountInCurrentViewInstanceState,
    viewBarComponentId,
  );

  return {
    setRecordCountInCurrentView: setEntityCountInCurrentView,
  };
};
