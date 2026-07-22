import { useCallback } from 'react';

import { type FlatView } from '@/metadata-store/types/FlatView';
import { type FlatViewGroup } from '@/metadata-store/types/FlatViewGroup';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { usePerformViewEntityAPIPersistOperation } from '@/views/hooks/internal/usePerformViewEntityAPIPersistOperation';
import { useViewsSideEffectsOnViewGroups } from '@/views/hooks/useViewsSideEffectsOnViewGroups';
import { useMutation } from '@apollo/client/react';
import { CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import {
  CreateViewDocument,
  type CreateViewMutationVariables,
  DestroyViewDocument,
  type DestroyViewMutationVariables,
  ViewType,
} from '~/generated-metadata/graphql';

export const usePerformViewAPIPersist = () => {
  const [createViewMutation] = useMutation(CreateViewDocument);
  const [destroyViewMutation] = useMutation(DestroyViewDocument);
  const { triggerViewGroupOptimisticEffectAtViewCreation } =
    useViewsSideEffectsOnViewGroups();

  const { performViewEntityAPIPersistOperation } =
    usePerformViewEntityAPIPersistOperation('view');

  const performViewAPICreate = useCallback(
    async (
      variables: CreateViewMutationVariables,
      objectMetadataItemId: string,
    ): Promise<
      MetadataRequestResult<Awaited<ReturnType<typeof createViewMutation>>>
    > => {
      const result = await performViewEntityAPIPersistOperation({
        persist: () => {
          const newViewId = variables.input.id ?? v4();
          if (variables.input.type === ViewType.KANBAN) {
            triggerViewGroupOptimisticEffectAtViewCreation({
              objectMetadataItemId: objectMetadataItemId,
              mainGroupByFieldMetadataId:
                variables.input.mainGroupByFieldMetadataId,
            });
          }

          return createViewMutation({
            variables: {
              input: {
                ...variables.input,
                id: newViewId,
              },
            },
          });
        },
        applyResultToDraft: (mutationResult, { addToDraft }) => {
          const newView = mutationResult.data?.createView;

          if (!isDefined(newView)) {
            throw new Error('Failed to create view');
          }

          const {
            __typename,
            viewFields: _viewFields,
            viewFieldGroups: _viewFieldGroups,
            viewFilters: _viewFilters,
            viewFilterGroups: _viewFilterGroups,
            viewSorts: _viewSorts,
            viewGroups,
            ...flatView
          } = newView;

          addToDraft({ key: 'views', items: [flatView as FlatView] });

          // The server auto-creates viewGroups for Kanban views (mainGroupByFieldMetadataId)
          addToDraft({
            key: 'viewGroups',
            items: viewGroups.map(
              ({ __typename: _viewGroupTypename, ...viewGroup }) =>
                viewGroup as FlatViewGroup,
            ),
          });
        },
        operationType: CrudOperationType.CREATE,
      });

      return result;
    },
    [
      createViewMutation,
      triggerViewGroupOptimisticEffectAtViewCreation,
      performViewEntityAPIPersistOperation,
    ],
  );

  const performViewAPIDestroy = useCallback(
    async (
      variables: DestroyViewMutationVariables,
    ): Promise<
      MetadataRequestResult<Awaited<ReturnType<typeof destroyViewMutation>>>
    > =>
      performViewEntityAPIPersistOperation({
        persist: () =>
          destroyViewMutation({
            variables,
          }),
        applyResultToDraft: (_result, { removeFromDraft }) =>
          removeFromDraft({ key: 'views', itemIds: [variables.id] }),
        operationType: CrudOperationType.DELETE,
      }),
    [destroyViewMutation, performViewEntityAPIPersistOperation],
  );

  return {
    performViewAPICreate,
    performViewAPIDestroy,
  };
};
