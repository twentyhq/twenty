import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';

export const useGetCurrentViewOnly = () => {
  const currentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );

  const currentView = useAtomFamilySelectorValue(
    coreViewFromViewIdFamilySelector,
    {
      viewId: currentViewId ?? '',
    },
  );

  return {
    currentView,
  };
};
