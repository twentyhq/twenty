import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { usePersistView } from '@/views/hooks/internal/usePersistView';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { convertUpdateViewInputToCore } from '@/views/utils/convertUpdateViewInputToCore';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useSaveAnyFieldFilterToView = () => {
  const { updateView } = usePersistView();

  const { currentView } = useGetCurrentViewOnly();

  const anyFieldFilterValueCallbackState = useRecoilComponentCallbackState(
    anyFieldFilterValueComponentState,
  );

  const saveAnyFieldFilterToView = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        if (!isDefined(currentView)) {
          return;
        }

        const currentViewAnyFieldFilterValue = currentView?.anyFieldFilterValue;

        const currentAnyFieldFilterValue = snapshot
          .getLoadable(anyFieldFilterValueCallbackState)
          .getValue();

        if (currentAnyFieldFilterValue !== currentViewAnyFieldFilterValue) {
          const formattedCurrentView = convertUpdateViewInputToCore({
            ...currentView,
            anyFieldFilterValue: currentAnyFieldFilterValue,
          });
          await updateView({
            id: currentView.id,
            input: {
              ...formattedCurrentView,
              anyFieldFilterValue: currentAnyFieldFilterValue,
            },
          });
        }
      },
    [updateView, anyFieldFilterValueCallbackState, currentView],
  );

  return {
    saveAnyFieldFilterToView,
  };
};
