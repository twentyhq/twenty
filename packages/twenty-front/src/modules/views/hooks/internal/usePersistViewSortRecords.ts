import { useCallback } from 'react';

import { CREATE_CORE_VIEW_SORT } from '@/views/graphql/mutations/createCoreViewSort';
import { DESTROY_CORE_VIEW_SORT } from '@/views/graphql/mutations/destroyCoreViewSort';
import { UPDATE_CORE_VIEW_SORT } from '@/views/graphql/mutations/updateCoreViewSort';
import { type CoreViewSortEssential } from '@/views/types/CoreViewSortEssential';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { convertViewSortDirectionToCore } from '@/views/utils/convertViewSortDirectionToCore';
import { useApolloClient } from '@apollo/client';
import { type CoreViewSort } from '~/generated/graphql';

export const usePersistViewSortRecords = () => {
  const apolloClient = useApolloClient();

  const createCoreViewSortRecords = useCallback(
    (
      viewSortsToCreate: CoreViewSortEssential[],
      view: Pick<GraphQLView, 'id'>,
    ) => {
      if (!viewSortsToCreate.length) return;
      return Promise.all(
        viewSortsToCreate.map((viewSort) =>
          apolloClient.mutate({
            mutation: CREATE_CORE_VIEW_SORT,
            variables: {
              input: {
                id: viewSort.id,
                fieldMetadataId: viewSort.fieldMetadataId,
                viewId: view.id,
                direction: convertViewSortDirectionToCore(viewSort.direction),
              } satisfies Partial<CoreViewSort>,
            },
          }),
        ),
      );
    },
    [apolloClient],
  );

  const updateCoreViewSortRecords = useCallback(
    (viewSortsToUpdate: CoreViewSortEssential[]) => {
      if (!viewSortsToUpdate.length) return;
      return Promise.all(
        viewSortsToUpdate.map((viewSort) =>
          apolloClient.mutate({
            mutation: UPDATE_CORE_VIEW_SORT,
            variables: {
              id: viewSort.id,
              input: {
                direction: convertViewSortDirectionToCore(viewSort.direction),
              } satisfies Partial<CoreViewSort>,
            },
          }),
        ),
      );
    },
    [apolloClient],
  );

  const deleteCoreViewSortRecords = useCallback(
    (viewSortIdsToDelete: string[]) => {
      if (!viewSortIdsToDelete.length) return;
      return Promise.all(
        viewSortIdsToDelete.map((viewSortId) =>
          apolloClient.mutate({
            mutation: DESTROY_CORE_VIEW_SORT,
            variables: {
              id: viewSortId,
            },
          }),
        ),
      );
    },
    [apolloClient],
  );

  return {
    createViewSortRecords: createCoreViewSortRecords,
    updateViewSortRecords: updateCoreViewSortRecords,
    deleteViewSortRecords: deleteCoreViewSortRecords,
  };
};
