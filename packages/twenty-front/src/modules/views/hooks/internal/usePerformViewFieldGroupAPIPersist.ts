import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatViewFieldGroup } from '@/metadata-store/types/FlatViewFieldGroup';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CREATE_MANY_VIEW_FIELD_GROUPS } from '@/views/graphql/mutations/createManyViewFieldGroups';
import { DELETE_VIEW_FIELD_GROUP } from '@/views/graphql/mutations/deleteViewFieldGroup';
import { UPDATE_VIEW_FIELD_GROUP } from '@/views/graphql/mutations/updateViewFieldGroup';
import { useMutation } from '@apollo/client/react';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type ViewFieldGroup,
  type MutationCreateManyViewFieldGroupsArgs,
  type MutationDeleteViewFieldGroupArgs,
  type MutationUpdateViewFieldGroupArgs,
} from '~/generated-metadata/graphql';

type CreateManyViewFieldGroupsMutationResult = {
  createManyViewFieldGroups: ViewFieldGroup[];
};

type UpdateViewFieldGroupMutationResult = {
  updateViewFieldGroup: ViewFieldGroup;
};

type DeleteViewFieldGroupMutationResult = {
  deleteViewFieldGroup: ViewFieldGroup;
};

const toFlatViewFieldGroup = (
  viewFieldGroup: ViewFieldGroup,
): FlatViewFieldGroup => {
  const {
    __typename,
    viewFields: _viewFields,
    ...flatViewFieldGroup
  } = viewFieldGroup;

  return flatViewFieldGroup as FlatViewFieldGroup;
};

export const usePerformViewFieldGroupAPIPersist = () => {
  const [createManyViewFieldGroupsMutation] = useMutation<
    CreateManyViewFieldGroupsMutationResult,
    MutationCreateManyViewFieldGroupsArgs
  >(CREATE_MANY_VIEW_FIELD_GROUPS);
  const [updateViewFieldGroupMutation] = useMutation<
    UpdateViewFieldGroupMutationResult,
    MutationUpdateViewFieldGroupArgs
  >(UPDATE_VIEW_FIELD_GROUP);
  const [deleteViewFieldGroupMutation] = useMutation<
    DeleteViewFieldGroupMutationResult,
    MutationDeleteViewFieldGroupArgs
  >(DELETE_VIEW_FIELD_GROUP);

  const { addToDraft, updateInDraft, removeFromDraft, applyChanges } =
    useUpdateMetadataStoreDraft();

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const performViewFieldGroupAPICreate = useCallback(
    async (
      createViewFieldGroupInputs: MutationCreateManyViewFieldGroupsArgs,
    ): Promise<
      MetadataRequestResult<CreateManyViewFieldGroupsMutationResult | null>
    > => {
      if (
        !Array.isArray(createViewFieldGroupInputs.inputs) ||
        createViewFieldGroupInputs.inputs.length === 0
      ) {
        return {
          status: 'successful',
          response: null,
        };
      }

      try {
        const result = await createManyViewFieldGroupsMutation({
          variables: createViewFieldGroupInputs,
        });

        // Write created view field groups to the metadata store immediately so
        // a subsequent save doesn't diff against stale view data and re-send
        // the same create, which fails server-side on duplicate id
        const createdFlatViewFieldGroups = (
          result.data?.createManyViewFieldGroups ?? []
        ).map(toFlatViewFieldGroup);

        addToDraft({
          key: 'viewFieldGroups',
          items: createdFlatViewFieldGroups,
        });
        applyChanges();

        return {
          status: 'successful',
          response: result.data ?? null,
        };
      } catch (error) {
        if (CombinedGraphQLErrors.is(error)) {
          handleMetadataError(error, {
            primaryMetadataName: 'viewFieldGroup',
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
      createManyViewFieldGroupsMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
      addToDraft,
      applyChanges,
    ],
  );

  const performViewFieldGroupAPIUpdate = useCallback(
    async (
      updateViewFieldGroupInputs: MutationUpdateViewFieldGroupArgs[],
    ): Promise<
      MetadataRequestResult<UpdateViewFieldGroupMutationResult[] | null>
    > => {
      if (updateViewFieldGroupInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          updateViewFieldGroupInputs.map((variables) =>
            updateViewFieldGroupMutation({
              variables,
            }),
          ),
        );

        const updatedFlatViewFieldGroups = results
          .map((result) => result.data?.updateViewFieldGroup)
          .filter(isDefined)
          .map(toFlatViewFieldGroup);

        updateInDraft('viewFieldGroups', updatedFlatViewFieldGroups);
        applyChanges();

        return {
          status: 'successful',
          response: results
            .map((r) => r.data)
            .filter(isDefined) as UpdateViewFieldGroupMutationResult[],
        };
      } catch (error) {
        if (CombinedGraphQLErrors.is(error)) {
          handleMetadataError(error, {
            primaryMetadataName: 'viewFieldGroup',
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
      updateViewFieldGroupMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
      updateInDraft,
      applyChanges,
    ],
  );

  const performViewFieldGroupAPIDelete = useCallback(
    async (
      deleteViewFieldGroupInputs: MutationDeleteViewFieldGroupArgs[],
    ): Promise<
      MetadataRequestResult<DeleteViewFieldGroupMutationResult[] | null>
    > => {
      if (deleteViewFieldGroupInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          deleteViewFieldGroupInputs.map((variables) =>
            deleteViewFieldGroupMutation({
              variables,
            }),
          ),
        );

        removeFromDraft({
          key: 'viewFieldGroups',
          itemIds: deleteViewFieldGroupInputs.map(
            (variables) => variables.input.id,
          ),
        });
        applyChanges();

        return {
          status: 'successful',
          response: results
            .map((r) => r.data)
            .filter(isDefined) as DeleteViewFieldGroupMutationResult[],
        };
      } catch (error) {
        if (CombinedGraphQLErrors.is(error)) {
          handleMetadataError(error, {
            primaryMetadataName: 'viewFieldGroup',
            operationType: CrudOperationType.DELETE,
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
      deleteViewFieldGroupMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
      removeFromDraft,
      applyChanges,
    ],
  );

  return {
    performViewFieldGroupAPICreate,
    performViewFieldGroupAPIUpdate,
    performViewFieldGroupAPIDelete,
  };
};
