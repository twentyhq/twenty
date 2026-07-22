import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatViewGroup } from '@/metadata-store/types/FlatViewGroup';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyArray } from '@sniptt/guards';
import { CrudOperationType } from 'twenty-shared/types';
import {
  type CreateManyViewGroupsMutationVariables,
  type UpdateManyViewGroupsMutationVariables,
  CreateManyViewGroupsDocument,
  UpdateManyViewGroupsDocument,
} from '~/generated-metadata/graphql';

export const usePerformViewGroupAPIPersist = () => {
  const [updateManyViewGroupsMutation] = useMutation(
    UpdateManyViewGroupsDocument,
  );

  const [createManyViewGroupsMutation] = useMutation(
    CreateManyViewGroupsDocument,
  );

  const { addToDraft, updateInDraft, applyChanges } =
    useUpdateMetadataStoreDraft();

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const performViewGroupAPIUpdate = useCallback(
    async (
      updateViewGroupInputs: UpdateManyViewGroupsMutationVariables,
    ): Promise<
      MetadataRequestResult<Awaited<
        ReturnType<typeof updateManyViewGroupsMutation>
      > | null>
    > => {
      if (!isNonEmptyArray(updateViewGroupInputs.inputs)) {
        return {
          status: 'successful',
          response: null,
        };
      }

      try {
        const result = await updateManyViewGroupsMutation({
          variables: updateViewGroupInputs,
        });

        const updatedFlatViewGroups = (
          result.data?.updateManyViewGroups ?? []
        ).map(({ __typename, ...viewGroup }) => viewGroup as FlatViewGroup);

        updateInDraft('viewGroups', updatedFlatViewGroups);
        applyChanges();

        return {
          status: 'successful',
          response: result,
        };
      } catch (error) {
        if (CombinedGraphQLErrors.is(error)) {
          handleMetadataError(error, {
            primaryMetadataName: 'viewGroup',
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
      updateManyViewGroupsMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
      updateInDraft,
      applyChanges,
    ],
  );

  const performViewGroupAPICreate = useCallback(
    async (
      createViewGroupInputs: CreateManyViewGroupsMutationVariables,
    ): Promise<
      MetadataRequestResult<Awaited<
        ReturnType<typeof createManyViewGroupsMutation>
      > | null>
    > => {
      if (!isNonEmptyArray(createViewGroupInputs.inputs)) {
        return {
          status: 'successful',
          response: null,
        };
      }

      try {
        const result = await createManyViewGroupsMutation({
          variables: createViewGroupInputs,
        });

        // Write created view groups to the metadata store immediately so a
        // subsequent save doesn't diff against stale view data and re-send
        // the same create, which fails server-side on duplicate id
        const createdFlatViewGroups = (
          result.data?.createManyViewGroups ?? []
        ).map(({ __typename, ...viewGroup }) => viewGroup as FlatViewGroup);

        addToDraft({ key: 'viewGroups', items: createdFlatViewGroups });
        applyChanges();

        return {
          status: 'successful',
          response: result,
        };
      } catch (error) {
        if (CombinedGraphQLErrors.is(error)) {
          handleMetadataError(error, {
            primaryMetadataName: 'viewGroup',
            operationType: CrudOperationType.CREATE,
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
      createManyViewGroupsMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
      addToDraft,
      applyChanges,
    ],
  );

  return {
    performViewGroupAPIUpdate,
    performViewGroupAPICreate,
  };
};
