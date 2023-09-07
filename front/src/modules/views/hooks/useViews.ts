import type { Context } from 'react';
import { useRecoilCallback } from 'recoil';

import { savedTableColumnsFamilyState } from '@/ui/table/states/savedTableColumnsFamilyState';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { currentViewIdScopedState } from '@/ui/view-bar/states/currentViewIdScopedState';
import { savedFiltersFamilyState } from '@/ui/view-bar/states/savedFiltersFamilyState';
import { savedSortsFamilyState } from '@/ui/view-bar/states/savedSortsFamilyState';
import { viewsByIdScopedSelector } from '@/ui/view-bar/states/selectors/viewsByIdScopedSelector';
import { viewsScopedState } from '@/ui/view-bar/states/viewsScopedState';
import type { View } from '@/ui/view-bar/types/View';
import {
  useCreateViewMutation,
  useDeleteViewMutation,
  useGetViewsQuery,
  useUpdateViewMutation,
  ViewType,
} from '~/generated/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useViews = ({
  objectId,
  onViewCreate,
  scopeContext,
  type,
}: {
  objectId: 'company' | 'person';
  onViewCreate?: (viewId: string) => Promise<void>;
  scopeContext: Context<string | null>;
  type: ViewType;
}) => {
  const [currentViewId, setCurrentViewId] = useRecoilScopedState(
    currentViewIdScopedState,
    scopeContext,
  );
  const [views, setViews] = useRecoilScopedState(
    viewsScopedState,
    scopeContext,
  );
  const viewsById = useRecoilScopedValue(viewsByIdScopedSelector, scopeContext);

  const [createViewMutation] = useCreateViewMutation();
  const [updateViewMutation] = useUpdateViewMutation();
  const [deleteViewMutation] = useDeleteViewMutation();

  const createView = async (view: View) => {
    const { data } = await createViewMutation({
      variables: {
        data: {
          ...view,
          objectId,
          type: ViewType.Table,
        },
      },
    });

    if (data?.view) await onViewCreate?.(data.view.id);
  };

  const updateView = (view: View) =>
    updateViewMutation({
      variables: {
        data: { name: view.name },
        where: { id: view.id },
      },
    });

  const deleteView = (viewId: string) =>
    deleteViewMutation({ variables: { where: { id: viewId } } });

  const handleResetSavedViews = useRecoilCallback(
    ({ reset }) =>
      () => {
        views.forEach((view) => {
          reset(savedTableColumnsFamilyState(view.id));
          reset(savedFiltersFamilyState(view.id));
          reset(savedSortsFamilyState(view.id));
        });
      },
    [views],
  );

  const { loading, refetch } = useGetViewsQuery({
    variables: {
      where: {
        objectId: { equals: objectId },
        type: { equals: type },
      },
    },
    onCompleted: (data) => {
      const nextViews = data.views.map((view) => ({
        id: view.id,
        name: view.name,
      }));

      if (!isDeeplyEqual(views, nextViews)) setViews(nextViews);

      // If there is no current view selected,
      // or if the current view cannot be found in the views list (user switched workspaces)
      if (
        nextViews.length &&
        (!currentViewId || !nextViews.some((view) => view.id === currentViewId))
      ) {
        setCurrentViewId(nextViews[0].id);
        handleResetSavedViews();
      }
    },
  });

  const handleViewsChange = async (nextViews: View[]) => {
    const viewToCreate = nextViews.find((nextView) => !viewsById[nextView.id]);
    if (viewToCreate) {
      await createView(viewToCreate);
      await refetch();
      return;
    }

    const viewToUpdate = nextViews.find(
      (nextView) =>
        viewsById[nextView.id] && viewsById[nextView.id].name !== nextView.name,
    );
    if (viewToUpdate) {
      await updateView(viewToUpdate);
      await refetch();
      return;
    }

    const nextViewIds = nextViews.map((nextView) => nextView.id);
    const viewIdToDelete = Object.keys(viewsById).find(
      (previousViewId) => !nextViewIds.includes(previousViewId),
    );
    if (viewIdToDelete) await deleteView(viewIdToDelete);

    await refetch();
  };

  return { handleViewsChange, isFetchingViews: loading };
};
