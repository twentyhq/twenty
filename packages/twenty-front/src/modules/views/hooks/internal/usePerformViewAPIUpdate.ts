import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatView } from '@/metadata-store/types/FlatView';
import { type FlatViewGroup } from '@/metadata-store/types/FlatViewGroup';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useMutation } from '@apollo/client/react';
import {
  type UpdateViewMutationVariables,
  UpdateViewDocument,
} from '~/generated-metadata/graphql';

export const usePerformViewAPIUpdate = () => {
  const [updateViewMutation] = useMutation(UpdateViewDocument);

  const { updateInDraft, addToDraft, removeFromDraft, applyChanges } =
    useUpdateMetadataStoreDraft();

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const store = useStore();

  // The server recreates the view groups when mainGroupByFieldMetadataId changes,
  // so the store has to be realigned on the groups returned by the mutation
  const syncViewGroupsFromMutationResult = useCallback(
    (
      viewId: string,
      viewGroups: (FlatViewGroup & { __typename?: string })[],
    ) => {
      const viewGroupsEntry = store.get(
        metadataStoreState.atomFamily('viewGroups'),
      );

      const existingViewGroups = (
        viewGroupsEntry.status === 'draft-pending'
          ? viewGroupsEntry.draft
          : viewGroupsEntry.current
      ) as FlatViewGroup[];

      const updatedViewGroupIds = new Set(
        viewGroups.map((viewGroup) => viewGroup.id),
      );

      const deletedViewGroupIds = existingViewGroups
        .filter(
          (viewGroup) =>
            viewGroup.viewId === viewId &&
            !updatedViewGroupIds.has(viewGroup.id),
        )
        .map((viewGroup) => viewGroup.id);

      removeFromDraft({ key: 'viewGroups', itemIds: deletedViewGroupIds });

      addToDraft({
        key: 'viewGroups',
        items: viewGroups.map(
          ({ __typename: _typename, ...viewGroup }) => viewGroup,
        ),
      });

      applyChanges();
    },
    [store, addToDraft, removeFromDraft, applyChanges],
  );

  const performViewAPIUpdate = useCallback(
    async (
      variables: UpdateViewMutationVariables,
    ): Promise<
      MetadataRequestResult<Awaited<ReturnType<typeof updateViewMutation>>>
    > => {
      const viewsStoreAtom = metadataStoreState.atomFamily('views');
      const previousViewsEntry = store.get(viewsStoreAtom);

      updateInDraft('views', [
        { id: variables.id, ...variables.input } as FlatView,
      ]);
      applyChanges();

      try {
        const result = await updateViewMutation({
          variables,
        });

        const hasUpdatedMainGroupByFieldMetadataId =
          variables.input.mainGroupByFieldMetadataId !== undefined;

        const updatedViewGroups = result.data?.updateView?.viewGroups;

        if (
          hasUpdatedMainGroupByFieldMetadataId &&
          isDefined(updatedViewGroups)
        ) {
          syncViewGroupsFromMutationResult(
            variables.id,
            updatedViewGroups as (FlatViewGroup & { __typename?: string })[],
          );
        }

        return {
          status: 'successful',
          response: result,
        };
      } catch (error) {
        store.set(viewsStoreAtom, previousViewsEntry);

        if (CombinedGraphQLErrors.is(error)) {
          handleMetadataError(error, {
            primaryMetadataName: 'view',
            operationType: CrudOperationType.UPDATE,
          });
        } else {
          enqueueErrorSnackBar({ message: t`An error occurred.` });
        }

        return {
          status: 'failed',
          error,
        };
      }
    },
    [
      updateViewMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
      updateInDraft,
      applyChanges,
      syncViewGroupsFromMutationResult,
      store,
    ],
  );

  return { performViewAPIUpdate };
};
