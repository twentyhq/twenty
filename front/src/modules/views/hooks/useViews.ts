import { useRecoilCallback } from 'recoil';

import { savedFiltersScopedState } from '@/ui/filter-n-sort/states/savedFiltersScopedState';
import { savedSortsScopedState } from '@/ui/filter-n-sort/states/savedSortsScopedState';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { savedTableColumnsScopedState } from '@/ui/table/states/savedTableColumnsScopedState';
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
  type,
}: {
  objectId: 'company' | 'person';
  onViewCreate: (viewId: string) => Promise<void>;
  type: ViewType;
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

  const createView = async (view: TableView) => {
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
  };

  const updateView = (view: TableView) =>
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
        tableViews.forEach((view) => {
          reset(savedTableColumnsScopedState(view.id));
          reset(savedFiltersScopedState(view.id));
          reset(savedSortsScopedState(view.id));
        });
      },
    [tableViews],
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

      if (!isDeeplyEqual(tableViews, nextViews)) setTableViews(nextViews);

      // If there is no current view selected,
      // or if the current view cannot be found in the views list (user switched workspaces)
      if (
        nextViews.length &&
        (!currentTableViewId ||
          !nextViews.some((view) => view.id === currentTableViewId))
      ) {
        setCurrentTableViewId(nextViews[0].id);
        handleResetSavedViews();
      }
    },
  });

  const handleViewsChange = async (nextViews: TableView[]) => {
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
  };

  return { handleViewsChange, isFetchingViews: loading };
};
