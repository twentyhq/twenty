import { getOperationName } from '@apollo/client/utilities';

import { RecoilScopeContext } from '@/types/RecoilScopeContext';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { currentViewIdScopedState } from '@/ui/view-bar/states/currentViewIdScopedState';
import { viewsScopedState } from '@/ui/view-bar/states/viewsScopedState';
import { View } from '@/ui/view-bar/types/View';
import {
  useCreateViewMutation,
  useDeleteViewMutation,
  useGetViewsQuery,
  useUpdateViewMutation,
  ViewType,
} from '~/generated/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { GET_VIEWS } from '../graphql/queries/getViews';

export const useViews = ({
  objectId,
  onViewCreate,
  RecoilScopeContext,
  type,
}: {
  objectId: 'company' | 'person';
  onViewCreate?: (viewId: string) => Promise<void>;
  RecoilScopeContext: RecoilScopeContext;
  type: ViewType;
}) => {
  const [currentViewId, setCurrentViewId] = useRecoilScopedState(
    currentViewIdScopedState,
    RecoilScopeContext,
  );
  const [views, setViews] = useRecoilScopedState(
    viewsScopedState,
    RecoilScopeContext,
  );

  const [createViewMutation] = useCreateViewMutation();
  const [updateViewMutation] = useUpdateViewMutation();
  const [deleteViewMutation] = useDeleteViewMutation();

  const createView = async (view: View) => {
    const { data } = await createViewMutation({
      variables: {
        data: {
          ...view,
          objectId,
          type,
        },
      },
      refetchQueries: [getOperationName(GET_VIEWS) ?? ''],
    });

    if (data?.view) await onViewCreate?.(data.view.id);
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
