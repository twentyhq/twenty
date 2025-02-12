import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { View } from '@/views/types/View';

import { useMemo } from 'react';

export const useGetCurrentViewOnly = () => {
  const { records: views } = usePrefetchedData<View>(PrefetchKey.AllViews);

  const currentViewId = useRecoilComponentValueV2(currentViewIdComponentState);

  const currentView = useMemo(
    () => views.find((view) => view.id === currentViewId),
    [views, currentViewId],
  );

  return {
    currentView,
  };
};
