import { useCallback } from 'react';

import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatView } from '@/metadata-store/types/FlatView';
import { type FlatViewGroup } from '@/metadata-store/types/FlatViewGroup';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { usePerformViewEntityApiPersistOperation } from '@/views/hooks/internal/usePerformViewEntityApiPersistOperation';
import { useViewsSideEffectsOnViewGroups } from '@/views/hooks/useViewsSideEffectsOnViewGroups';
import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
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

export const usePerformViewApiPersist = () => {
  const [createViewMutation] = useMutation(CreateViewDocument);
  const [destroyViewMutation] = useMutation(DestroyViewDocument);
  const store = useStore();
  const { applyChanges, removeFromDraft } = useUpdateMetadataStoreDraft();
  const { triggerViewGroupOptimisticEffectAtViewCreation } =
    useViewsSideEffectsOnViewGroups();

  const { performViewEntityApiPersistOperation } =
    usePerformViewEntityApiPersistOperation('view');

  const performViewApiCreate = useCallback(
    async (
      variables: CreateViewMutationVariables,
      objectMetadataItemId: string,
    ): Promise<
      MetadataRequestResult<Awaited<ReturnType<typeof createViewMutation>>>
    > => {
      const result = await performViewEntityApiPersistOperation({
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
      performViewEntityApiPersistOperation,
    ],
  );

  const performViewApiDestroy = useCallback(
    async (
      variables: DestroyViewMutationVariables,
    ): Promise<
      MetadataRequestResult<Awaited<ReturnType<typeof destroyViewMutation>>>
    > => {
      const viewsStoreAtom = metadataStoreState.atomFamily('views');
      const previousViewsEntry = store.get(viewsStoreAtom);

      removeFromDraft({ key: 'views', itemIds: [variables.id] });
      applyChanges();

      const result = await performViewEntityApiPersistOperation({
        persist: () =>
          destroyViewMutation({
            variables,
          }),
        applyResultToDraft: (_result, { removeFromDraft }) =>
          removeFromDraft({ key: 'views', itemIds: [variables.id] }),
        operationType: CrudOperationType.DELETE,
      });

      if (result.status === 'failed') {
        store.set(viewsStoreAtom, previousViewsEntry);
      }

      return result;
    },
    [
      applyChanges,
      destroyViewMutation,
      performViewEntityApiPersistOperation,
      removeFromDraft,
      store,
    ],
  );

  return {
    performViewApiCreate,
    performViewApiDestroy,
  };
};
