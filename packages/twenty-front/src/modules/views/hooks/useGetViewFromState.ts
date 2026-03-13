import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useGetViewFromState = () => {
  const store = useStore();

  const getViewFromState = useCallback(
    (viewId: string) => {
      return store.get(
        coreViewFromViewIdFamilySelector.selectorFamily({ viewId }),
      );
    },
    [store],
  );

  return {
    getViewFromState,
  };
};
