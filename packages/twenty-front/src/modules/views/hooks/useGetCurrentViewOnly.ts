import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';
import { useFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValue';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';

export const useGetCurrentViewOnly = () => {
  const currentViewId = useAtomComponentValue(
    contextStoreCurrentViewIdComponentState,
  );

  const currentView = useFamilySelectorValue(coreViewFromViewIdFamilySelector, {
    viewId: currentViewId ?? '',
  });

  return {
    currentView,
  };
};
