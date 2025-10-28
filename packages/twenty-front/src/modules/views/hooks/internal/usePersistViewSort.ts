import { useCallback } from 'react';

import { CREATE_CORE_VIEW_SORT } from '@/views/graphql/mutations/createCoreViewSort';
import { DESTROY_CORE_VIEW_SORT } from '@/views/graphql/mutations/destroyCoreViewSort';
import { UPDATE_CORE_VIEW_SORT } from '@/views/graphql/mutations/updateCoreViewSort';
import { useTriggerViewSortOptimisticEffect } from '@/views/optimistic-effects/hooks/useTriggerViewSortOptimisticEffect';
import { type CoreViewSortEssential } from '@/views/types/CoreViewSortEssential';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { useApolloClient } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';
import { type CoreViewSort } from '~/generated/graphql';

export const usePersistViewSortRecords = () => {
  const apolloClient = useApolloClient();

  const { triggerViewSortOptimisticEffect } =
    useTriggerViewSortOptimisticEffect();

  const createViewSorts = useCallback(
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
                direction: viewSort.direction,
              } satisfies Partial<CoreViewSort>,
            },
            update: (_cache, { data }) => {
              const createdViewSort = data?.createCoreViewSort;
              if (!isDefined(createdViewSort)) return;

              triggerViewSortOptimisticEffect({
                createdViewSorts: [createdViewSort],
              });
            },
          }),
        ),
      );
    },
    [apolloClient, triggerViewSortOptimisticEffect],
  );

  const updateViewSorts = useCallback(
    (viewSortsToUpdate: CoreViewSortEssential[]) => {
      if (!viewSortsToUpdate.length) return;
      return Promise.all(
        viewSortsToUpdate.map((viewSort) =>
          apolloClient.mutate({
            mutation: UPDATE_CORE_VIEW_SORT,
            variables: {
              id: viewSort.id,
              input: {
                direction: viewSort.direction,
              } satisfies Partial<CoreViewSort>,
            },
            update: (_cache, { data }) => {
              const updatedViewSort = data?.updateCoreViewSort;
              if (!isDefined(updatedViewSort)) return;

              triggerViewSortOptimisticEffect({
                updatedViewSorts: [updatedViewSort],
              });
            },
          }),
        ),
      );
    },
    [apolloClient, triggerViewSortOptimisticEffect],
  );

  const deleteViewSorts = useCallback(
    (viewSortsToDelete: Pick<CoreViewSortEssential, 'id' | 'viewId'>[]) => {
      if (!viewSortsToDelete.length) return;
      return Promise.all(
        viewSortsToDelete.map((viewSort) =>
          apolloClient.mutate({
            mutation: DESTROY_CORE_VIEW_SORT,
            variables: {
              id: viewSort.id,
            },
            update: (_cache) => {
              triggerViewSortOptimisticEffect({
                deletedViewSorts: [viewSort],
              });
            },
          }),
        ),
      );
    },
    [apolloClient, triggerViewSortOptimisticEffect],
  );

  return {
    createViewSorts,
    updateViewSorts,
    deleteViewSorts,
  };
};
