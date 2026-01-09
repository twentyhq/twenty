import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { usePerformViewAPIUpdate } from '@/views/hooks/internal/usePerformViewAPIUpdate';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { convertUpdateViewInputToCore } from '@/views/utils/convertUpdateViewInputToCore';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useSaveAnyFieldFilterToView = () => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const { performViewAPIUpdate } = usePerformViewAPIUpdate();

  const { currentView } = useGetCurrentViewOnly();

  const anyFieldFilterValueCallbackState = useRecoilComponentCallbackState(
    anyFieldFilterValueComponentState,
  );

  const saveAnyFieldFilterToView = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        if (!canPersistChanges || !isDefined(currentView)) {
          return;
        }

        const currentViewAnyFieldFilterValue = currentView.anyFieldFilterValue;

        const currentAnyFieldFilterValue = snapshot
          .getLoadable(anyFieldFilterValueCallbackState)
          .getValue();

        if (currentAnyFieldFilterValue !== currentViewAnyFieldFilterValue) {
          await performViewAPIUpdate({
            id: currentView.id,
            input: convertUpdateViewInputToCore({
              ...currentView,
              anyFieldFilterValue: currentAnyFieldFilterValue,
            }),
          });
        }
      },
    [
      canPersistChanges,
      performViewAPIUpdate,
      anyFieldFilterValueCallbackState,
      currentView,
    ],
  );

  return {
    saveAnyFieldFilterToView,
  };
};
