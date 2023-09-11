import { Context, useCallback } from 'react';
import { useRecoilCallback, useRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { currentViewIdScopedState } from '../states/currentViewIdScopedState';
import { filtersScopedState } from '../states/filtersScopedState';
import { savedFiltersFamilyState } from '../states/savedFiltersFamilyState';
import { savedSortsFamilyState } from '../states/savedSortsFamilyState';
import { sortsScopedState } from '../states/sortsScopedState';
import { viewEditModeState } from '../states/viewEditModeState';
import { viewsScopedState } from '../states/viewsScopedState';
import type { View } from '../types/View';

export const useUpsertView = ({
  onViewsChange,
  scopeContext,
}: {
  onViewsChange?: (views: View[]) => void | Promise<void>;
  scopeContext: Context<string | null>;
}) => {
  const filters = useRecoilScopedValue(filtersScopedState, scopeContext);
  const sorts = useRecoilScopedValue(sortsScopedState, scopeContext);

  const [, setCurrentViewId] = useRecoilScopedState(
    currentViewIdScopedState,
    scopeContext,
  );
  const [views, setViews] = useRecoilScopedState(
    viewsScopedState,
    scopeContext,
  );
  const [viewEditMode, setViewEditMode] = useRecoilState(viewEditModeState);

  const resetViewEditMode = useCallback(
    () => setViewEditMode({ mode: undefined, viewId: undefined }),
    [setViewEditMode],
  );

  const upsertView = useRecoilCallback(
    ({ set }) =>
      async (name?: string) => {
        if (!viewEditMode.mode || !name) return resetViewEditMode();

        if (viewEditMode.mode === 'create') {
          const viewToCreate = { id: v4(), name };
          const nextViews = [...views, viewToCreate];

          set(savedFiltersFamilyState(viewToCreate.id), filters);
          set(savedSortsFamilyState(viewToCreate.id), sorts);

          setViews(nextViews);
          await onViewsChange?.(nextViews);

          setCurrentViewId(viewToCreate.id);
        }

        if (viewEditMode.mode === 'edit') {
          const nextViews = views.map((view) =>
            view.id === viewEditMode.viewId ? { ...view, name } : view,
          );

          setViews(nextViews);
          await onViewsChange?.(nextViews);
        }

        return resetViewEditMode();
      },
    [
      filters,
      onViewsChange,
      resetViewEditMode,
      setCurrentViewId,
      setViews,
      sorts,
      viewEditMode.mode,
      viewEditMode.viewId,
      views,
    ],
  );

  return { upsertView };
};
