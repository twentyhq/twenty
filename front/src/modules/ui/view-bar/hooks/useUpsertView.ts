import { type Context, useContext } from 'react';
import { useRecoilCallback, useRecoilValue, useResetRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { useContextScopeId } from '@/ui/utilities/recoil-scope/hooks/useContextScopeId';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { ViewBarContext } from '../contexts/ViewBarContext';
import { currentViewIdScopedState } from '../states/currentViewIdScopedState';
import { filtersScopedState } from '../states/filtersScopedState';
import { savedFiltersFamilyState } from '../states/savedFiltersFamilyState';
import { savedSortsFamilyState } from '../states/savedSortsFamilyState';
import { currentViewScopedSelector } from '../states/selectors/currentViewScopedSelector';
import { viewsByIdScopedSelector } from '../states/selectors/viewsByIdScopedSelector';
import { sortsScopedState } from '../states/sortsScopedState';
import { viewEditModeState } from '../states/viewEditModeState';
import { viewsScopedState } from '../states/viewsScopedState';

export const useUpsertView = ({
  scopeContext,
}: {
  scopeContext: Context<string | null>;
}) => {
  const { onViewCreate, onViewEdit } = useContext(ViewBarContext);
  const recoilScopeId = useContextScopeId(scopeContext);

  const filters = useRecoilScopedValue(filtersScopedState, scopeContext);
  const sorts = useRecoilScopedValue(sortsScopedState, scopeContext);
  const viewEditMode = useRecoilValue(viewEditModeState);
  const resetViewEditMode = useResetRecoilState(viewEditModeState);

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

        const viewsById = await snapshot.getPromise(
          viewsByIdScopedSelector(recoilScopeId),
        );
        const currentView = await snapshot.getPromise(
          currentViewScopedSelector(recoilScopeId),
        );

        const viewToEdit = viewEditMode.viewId
          ? viewsById[viewEditMode.viewId]
          : currentView;

        if (!viewToEdit) {
          resetViewEditMode();
          return;
        }

        const editedView = {
          ...viewToEdit,
          name,
        };

        set(viewsScopedState(recoilScopeId), (previousViews) =>
          previousViews.map((previousView) =>
            previousView.id === editedView.id ? editedView : previousView,
          ),
        );

        await onViewEdit?.(editedView);

        resetViewEditMode();

        return editedView;
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
