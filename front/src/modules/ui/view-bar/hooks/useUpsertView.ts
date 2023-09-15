import { useCallback, useContext } from 'react';
import { useRecoilCallback, useRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { useRecoilScopeId } from '@/ui/utilities/recoil-scope/hooks/useContextScopeId';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { ViewBarContext } from '../contexts/ViewBarContext';
import { currentViewIdScopedState } from '../states/currentViewIdScopedState';
import { filtersScopedState } from '../states/filtersScopedState';
import { savedFiltersFamilyState } from '../states/savedFiltersFamilyState';
import { savedSortsFamilyState } from '../states/savedSortsFamilyState';
import { viewsByIdScopedSelector } from '../states/selectors/viewsByIdScopedSelector';
import { sortsScopedState } from '../states/sortsScopedState';
import { viewEditModeState } from '../states/viewEditModeState';
import { viewsScopedState } from '../states/viewsScopedState';

export const useUpsertView = () => {
  const { onViewCreate, onViewEdit, ViewBarRecoilScopeContext } =
    useContext(ViewBarContext);
  const recoilScopeId = useRecoilScopeId(ViewBarRecoilScopeContext);

  const filters = useRecoilScopedValue(
    filtersScopedState,
    ViewBarRecoilScopeContext,
  );
  const sorts = useRecoilScopedValue(
    sortsScopedState,
    ViewBarRecoilScopeContext,
  );
  const [viewEditMode, setViewEditMode] = useRecoilState(viewEditModeState);

  const resetViewEditMode = useCallback(
    () => setViewEditMode({ mode: undefined, viewId: undefined }),
    [setViewEditMode],
  );

  const upsertView = useRecoilCallback(
    ({ set, snapshot }) =>
      async (name?: string) => {
        if (!viewEditMode.mode || !name) {
          resetViewEditMode();
          return;
        }

        if (viewEditMode.mode === 'create') {
          const createdView = { id: v4(), name };

          set(savedFiltersFamilyState(createdView.id), filters);
          set(savedSortsFamilyState(createdView.id), sorts);

          set(viewsScopedState(recoilScopeId), (previousViews) => [
            ...previousViews,
            createdView,
          ]);

          await onViewCreate?.(createdView);

          resetViewEditMode();

          set(currentViewIdScopedState(recoilScopeId), createdView.id);

          return createdView;
        }

        if (viewEditMode.mode === 'edit' && viewEditMode.viewId) {
          const viewsById = await snapshot.getPromise(
            viewsByIdScopedSelector(recoilScopeId),
          );
          const editedView = { ...viewsById[viewEditMode.viewId], name };

          set(viewsScopedState(recoilScopeId), (previousViews) =>
            previousViews.map((previousView) =>
              previousView.id === viewEditMode.viewId
                ? editedView
                : previousView,
            ),
          );

          await onViewEdit?.(editedView);

          resetViewEditMode();

          return editedView;
        }
      },
    [
      filters,
      onViewCreate,
      onViewEdit,
      recoilScopeId,
      resetViewEditMode,
      sorts,
      viewEditMode.mode,
      viewEditMode.viewId,
    ],
  );

  return { upsertView };
};
