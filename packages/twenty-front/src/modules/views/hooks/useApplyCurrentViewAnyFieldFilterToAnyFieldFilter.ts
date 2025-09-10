import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useApplyCurrentViewAnyFieldFilterToAnyFieldFilter = () => {
  const currentViewId = useRecoilComponentValue(
    contextStoreCurrentViewIdComponentState,
  );

  const setAnyFieldFilterValue = useSetRecoilComponentState(
    anyFieldFilterValueComponentState,
  );

  const applyCurrentViewAnyFieldFilterToAnyFieldFilter = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const currentView = snapshot
          .getLoadable(
            coreViewFromViewIdFamilySelector({
              viewId: currentViewId ?? '',
            }),
          )
          .getValue();

        if (isDefined(currentView)) {
          setAnyFieldFilterValue(currentView.anyFieldFilterValue ?? '');
        }
      },
    [currentViewId, setAnyFieldFilterValue],
  );

  return {
    applyCurrentViewAnyFieldFilterToAnyFieldFilter,
  };
};
