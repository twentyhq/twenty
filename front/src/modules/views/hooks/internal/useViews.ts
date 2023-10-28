import { getOperationName } from '@apollo/client/utilities';
import { useRecoilCallback } from 'recoil';

import { viewObjectIdScopeState } from '@/views/states/viewObjectIdScopeState';
import { viewTypeScopedState } from '@/views/states/viewTypeScopedState';
import { View } from '@/views/types/View';
import {
  useCreateViewMutation,
  useDeleteViewMutation,
  useUpdateViewMutation,
} from '~/generated/graphql';

import { GET_VIEWS } from '../../graphql/queries/getViews';

export const useViews = (scopeId: string) => {
  const [createViewMutation] = useCreateViewMutation();
  const [updateViewMutation] = useUpdateViewMutation();
  const [deleteViewMutation] = useDeleteViewMutation();

  const createView = useRecoilCallback(
    ({ snapshot }) =>
      async (view: Pick<View, 'id' | 'name'>) => {
        const viewObjectId = await snapshot
          .getLoadable(viewObjectIdScopeState({ scopeId }))
          .getValue();

        const viewType = await snapshot
          .getLoadable(viewTypeScopedState({ scopeId }))
          .getValue();

        if (!viewObjectId || !viewType) {
          return;
        }
        await createViewMutation({
          variables: {
            data: {
              ...view,
              objectId: viewObjectId,
              type: viewType,
            },
          },
          refetchQueries: [getOperationName(GET_VIEWS) ?? ''],
        });
      },
  );

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

  return {
    createView,
    deleteView,
    isFetchingViews: false,
    updateView,
  };
};
