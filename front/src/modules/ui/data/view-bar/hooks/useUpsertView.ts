import { useContext } from 'react';
import { useRecoilCallback, useRecoilValue, useResetRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { useRecoilScopeId } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopeId';
import { useView } from '@/views/hooks/useView';

import { currentViewIdScopedState } from '../../../../views/states/currentViewIdScopedState';
import { savedSortsScopedFamilyState } from '../../../../views/states/savedSortsScopedFamilyState';
import { useSort } from '../../sort/hooks/useSort';
import { ViewBarContext } from '../contexts/ViewBarContext';
import { filtersScopedState } from '../states/filtersScopedState';
import { savedFiltersFamilyState } from '../states/savedFiltersFamilyState';
import { currentViewScopedSelector } from '../states/selectors/currentViewScopedSelector';
import { viewsByIdScopedSelector } from '../states/selectors/viewsByIdScopedSelector';
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
  const { scopeId: viewScopeId } = useView();
  const { sorts } = useSort();
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
          set(
            savedSortsScopedFamilyState({
              scopeId: viewScopeId,
              familyKey: createdView.id,
            }),
            sorts,
          );

          set(viewsScopedState(recoilScopeId), (previousViews) => [
            ...previousViews,
            createdView,
          ]);

          await onViewCreate?.(createdView);

          resetViewEditMode();

          set(
            currentViewIdScopedState({ scopeId: recoilScopeId }),
            createdView.id,
          );

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
      viewScopeId,
    ],
  );

  return { upsertView };
};
