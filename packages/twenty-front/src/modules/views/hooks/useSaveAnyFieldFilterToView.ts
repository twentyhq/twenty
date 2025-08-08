import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useUpdateView } from '@/views/hooks/useUpdateView';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useSaveAnyFieldFilterToView = () => {
  const { updateView } = useUpdateView();

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
          await updateView({
            ...currentView,
            anyFieldFilterValue: currentAnyFieldFilterValue,
          });
        }
      },
    [updateView, anyFieldFilterValueCallbackState, currentView],
  );

  return {
    saveAnyFieldFilterToView,
  };
};
