import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useGetViewById = () => {
  const store = useStore();

  const getViewById = useCallback(
    (viewId: string | null) => {
      const view = store.get(
        coreViewFromViewIdFamilySelector.selectorFamily({
          viewId: viewId ?? '',
        }),
      );

      return { view };
    },
    [store],
  );

  return {
    getViewById,
  };
};
