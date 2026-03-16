import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useGetViewById = () => {
  const store = useStore();

  const getViewById = useCallback(
    (viewId: string | null) => {
      const view = store.get(
        viewFromViewIdFamilySelector.selectorFamily({
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
