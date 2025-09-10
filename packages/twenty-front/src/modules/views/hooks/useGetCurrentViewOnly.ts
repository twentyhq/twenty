import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';

import { useRecoilValue } from 'recoil';

export const useGetCurrentViewOnly = () => {
  const currentViewId = useRecoilComponentValue(
    contextStoreCurrentViewIdComponentState,
  );

  const currentView = useRecoilValue(
    coreViewFromViewIdFamilySelector({
      viewId: currentViewId ?? '',
    }),
  );

  return {
    currentView,
  };
};
