import { coreViewsState } from '@/views/states/coreViewState';
import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { ViewType } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useSetIndexViews = () => {
  const store = useStore();

  const setIndexViews = useCallback(
    (indexViews: CoreViewWithRelations[]) => {
      const existingCoreViews = store.get(coreViewsState.atom);
      const existingFieldsWidgetViews = existingCoreViews.filter(
        (view) => view.type === ViewType.FIELDS_WIDGET,
      );
      const mergedViews = [...indexViews, ...existingFieldsWidgetViews];

      if (!isDeeplyEqual(existingCoreViews, mergedViews)) {
        store.set(coreViewsState.atom, mergedViews);
      }
    },
    [store],
  );

  return {
    setIndexViews,
  };
};
