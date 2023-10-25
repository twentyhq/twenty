import { getOperationName } from '@apollo/client/utilities';

import { View } from '@/ui/data/view-bar/types/View';
import {
  useCreateViewMutation,
  useDeleteViewMutation,
  useGetViewsQuery,
  useUpdateViewMutation,
} from '~/generated/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { GET_VIEWS } from '../../graphql/queries/getViews';
import { useViewStates } from '../useViewStates';

export const useViews = (scopeId: string) => {
  const {
    currentViewId,
    setCurrentViewId,
    viewType,
    viewObjectId,
    views,
    setViews,
  } = useViewStates(scopeId);

  const [createViewMutation] = useCreateViewMutation();
  const [updateViewMutation] = useUpdateViewMutation();
  const [deleteViewMutation] = useDeleteViewMutation();

  const createView = async (view: View) => {
    if (!viewObjectId || !viewType) {
      return;
    }
    const { data } = await createViewMutation({
      variables: {
        data: {
          ...view,
          objectId: viewObjectId,
          type: viewType,
        },
      },
      refetchQueries: [getOperationName(GET_VIEWS) ?? ''],
    });
  };

  const updateView = async (view: View) => {
    await updateViewMutation({
      variables: {
        data: { name: view.name },
        where: { id: view.id },
      },
      refetchQueries: [getOperationName(GET_VIEWS) ?? ''],
    });
  };

  const deleteView = async (viewId: string) => {
    await deleteViewMutation({
      variables: { where: { id: viewId } },
      refetchQueries: [getOperationName(GET_VIEWS) ?? ''],
    });
  };

  const { loading } = useGetViewsQuery({
    variables: {
      where: {
        objectId: { equals: viewObjectId },
        type: { equals: viewType },
      },
    },
    onCompleted: (data) => {
      const nextViews = data.views.map((view) => ({
        id: view.id,
        name: view.name,
      }));

      if (!isDeeplyEqual(views, nextViews)) setViews(nextViews);

      if (!nextViews.length) return;

      if (!currentViewId) return setCurrentViewId(nextViews[0].id);
    },
  });

  return {
    createView,
    deleteView,
    isFetchingViews: loading,
    updateView,
  };
};
