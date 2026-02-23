import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useApplyCurrentViewAnyFieldFilterToAnyFieldFilter = () => {
  const currentViewId = useRecoilComponentValue(
    contextStoreCurrentViewIdComponentState,
  );

  const setAnyFieldFilterValue = useSetRecoilComponentState(
    anyFieldFilterValueComponentState,
  );

  const store = useStore();

  const applyCurrentViewAnyFieldFilterToAnyFieldFilter = useCallback(() => {
    const currentView = store.get(
      coreViewFromViewIdFamilySelector.selectorFamily({
        viewId: currentViewId ?? '',
      }),
    );

    if (isDefined(currentView)) {
      setAnyFieldFilterValue(currentView.anyFieldFilterValue ?? '');
    }
  }, [currentViewId, setAnyFieldFilterValue, store]);

  return {
    applyCurrentViewAnyFieldFilterToAnyFieldFilter,
  };
};
