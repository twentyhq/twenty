import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useGetViewFromPrefetchState = () => {
  const store = useStore();

  const getViewFromPrefetchState = useCallback(
    (viewId: string) => {
      return store.get(
        coreViewFromViewIdFamilySelector.selectorFamily({ viewId }),
      );
    },
    [store],
  );

  return {
    getViewFromPrefetchState,
  };
};
