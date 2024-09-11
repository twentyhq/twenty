import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { entityCountInCurrentViewComponentState } from '@/views/states/entityCountInCurrentViewComponentState';

export const useSetRecordCountInCurrentView = (viewBarComponentId?: string) => {
  const setEntityCountInCurrentView = useSetRecoilComponentStateV2(
    entityCountInCurrentViewComponentState,
    viewBarComponentId,
  );

  return {
    setRecordCountInCurrentView: setEntityCountInCurrentView,
  };
};
