import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useApplyCurrentViewAnyFieldFilterToAnyFieldFilter = () => {
  const currentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );

  const setAnyFieldFilterValue = useSetAtomComponentState(
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
