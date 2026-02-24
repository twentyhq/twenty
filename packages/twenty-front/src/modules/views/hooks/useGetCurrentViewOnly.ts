import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useFamilySelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValueV2';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';

export const useGetCurrentViewOnly = () => {
  const currentViewId = useRecoilComponentValueV2(
    contextStoreCurrentViewIdComponentState,
  );

  const currentView = useFamilySelectorValueV2(
    coreViewFromViewIdFamilySelector,
    { viewId: currentViewId ?? '' },
  );

  return {
    currentView,
  };
};
