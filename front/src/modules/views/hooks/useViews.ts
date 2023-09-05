import { useCallback } from 'react';

import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import {
  currentTableViewIdState,
  type TableView,
  tableViewsByIdState,
  tableViewsState,
} from '@/ui/table/states/tableViewsState';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
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
}: {
  objectId: 'company' | 'person';
  onViewCreate: (viewId: string) => Promise<void>;
}) => {
  const [currentTableViewId, setCurrentTableViewId] = useRecoilScopedState(
    currentTableViewIdState,
    TableRecoilScopeContext,
  );
  const [tableViews, setTableViews] = useRecoilScopedState(
    tableViewsState,
    TableRecoilScopeContext,
  );
  const tableViewsById = useRecoilScopedValue(
    tableViewsByIdState,
    TableRecoilScopeContext,
  );

  const [createViewMutation] = useCreateViewMutation();
  const [updateViewMutation] = useUpdateViewMutation();
  const [deleteViewMutation] = useDeleteViewMutation();

  const createView = useCallback(
    async (view: TableView) => {
      const { data } = await createViewMutation({
        variables: {
          data: {
            ...view,
            objectId,
            type: ViewType.Table,
          },
        },
      });

      if (data?.view) await onViewCreate(data.view.id);
    },
    [createViewMutation, objectId, onViewCreate],
  );

  const updateView = useCallback(
    (view: TableView) =>
      updateViewMutation({
        variables: {
          data: { name: view.name },
          where: { id: view.id },
        },
      }),
    [updateViewMutation],
  );

  const deleteView = useCallback(
    (viewId: string) =>
      deleteViewMutation({ variables: { where: { id: viewId } } }),
    [deleteViewMutation],
  );

  const { refetch } = useGetViewsQuery({
    variables: {
      where: {
        objectId: { equals: objectId },
      },
    },
    onCompleted: (data) => {
      const nextViews = data.views.map((view) => ({
        id: view.id,
        name: view.name,
      }));

      if (!isDeeplyEqual(tableViews, nextViews)) setTableViews(nextViews);

      if (nextViews.length && !currentTableViewId)
        setCurrentTableViewId(nextViews[0].id);
    },
  });

  const handleViewsChange = useCallback(
    async (nextViews: TableView[]) => {
      const viewToCreate = nextViews.find(
        (nextView) => !tableViewsById[nextView.id],
      );
      if (viewToCreate) {
        await createView(viewToCreate);
        return refetch();
      }

      const viewToUpdate = nextViews.find(
        (nextView) =>
          tableViewsById[nextView.id] &&
          tableViewsById[nextView.id].name !== nextView.name,
      );
      if (viewToUpdate) {
        await updateView(viewToUpdate);
        return refetch();
      }

      const nextViewIds = nextViews.map((nextView) => nextView.id);
      const viewIdToDelete = Object.keys(tableViewsById).find(
        (previousViewId) => !nextViewIds.includes(previousViewId),
      );
      if (viewIdToDelete) await deleteView(viewIdToDelete);

      return refetch();
    },
    [createView, deleteView, refetch, tableViewsById, updateView],
  );

  return { handleViewsChange };
};
