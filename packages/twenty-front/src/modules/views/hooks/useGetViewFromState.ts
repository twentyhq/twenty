import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useGetViewFromState = () => {
  const store = useStore();

  const getViewFromState = useCallback(
    (viewId: string) => {
      return store.get(viewFromViewIdFamilySelector.selectorFamily({ viewId }));
    },
    [store],
  );

  return {
    getViewFromState,
  };
};
