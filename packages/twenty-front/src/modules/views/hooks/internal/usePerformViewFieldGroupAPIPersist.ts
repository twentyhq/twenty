import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CREATE_MANY_CORE_VIEW_FIELD_GROUPS } from '@/views/graphql/mutations/createManyCoreViewFieldGroups';
import { DELETE_CORE_VIEW_FIELD_GROUP } from '@/views/graphql/mutations/deleteCoreViewFieldGroup';
import { UPDATE_CORE_VIEW_FIELD_GROUP } from '@/views/graphql/mutations/updateCoreViewFieldGroup';
import { useTriggerViewFieldGroupOptimisticEffect } from '@/views/optimistic-effects/hooks/useTriggerViewFieldGroupOptimisticEffect';
import { useMutation, type ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type CoreViewFieldGroup,
  type MutationCreateManyCoreViewFieldGroupsArgs,
  type MutationDeleteCoreViewFieldGroupArgs,
  type MutationUpdateCoreViewFieldGroupArgs,
} from '~/generated-metadata/graphql';

type CreateManyCoreViewFieldGroupsMutationResult = {
  createManyCoreViewFieldGroups: CoreViewFieldGroup[];
};

type UpdateCoreViewFieldGroupMutationResult = {
  updateCoreViewFieldGroup: CoreViewFieldGroup;
};

type DeleteCoreViewFieldGroupMutationResult = {
  deleteCoreViewFieldGroup: CoreViewFieldGroup;
};

export const usePerformViewFieldGroupAPIPersist = () => {
  const { triggerViewFieldGroupOptimisticEffect } =
    useTriggerViewFieldGroupOptimisticEffect();

  const [createManyCoreViewFieldGroupsMutation] = useMutation<
    CreateManyCoreViewFieldGroupsMutationResult,
    MutationCreateManyCoreViewFieldGroupsArgs
  >(CREATE_MANY_CORE_VIEW_FIELD_GROUPS);
  const [updateCoreViewFieldGroupMutation] = useMutation<
    UpdateCoreViewFieldGroupMutationResult,
    MutationUpdateCoreViewFieldGroupArgs
  >(UPDATE_CORE_VIEW_FIELD_GROUP);
  const [deleteCoreViewFieldGroupMutation] = useMutation<
    DeleteCoreViewFieldGroupMutationResult,
    MutationDeleteCoreViewFieldGroupArgs
  >(DELETE_CORE_VIEW_FIELD_GROUP);

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const performViewFieldGroupAPICreate = useCallback(
    async (
      createCoreViewFieldGroupInputs: MutationCreateManyCoreViewFieldGroupsArgs,
    ): Promise<
      MetadataRequestResult<CreateManyCoreViewFieldGroupsMutationResult | null>
    > => {
      if (
        !Array.isArray(createCoreViewFieldGroupInputs.inputs) ||
        createCoreViewFieldGroupInputs.inputs.length === 0
      ) {
        return {
          status: 'successful',
          response: null,
        };
      }

      try {
        const result = await createManyCoreViewFieldGroupsMutation({
          variables: createCoreViewFieldGroupInputs,
          update: (_cache, { data }) => {
            const createdViewFieldGroups = data?.createManyCoreViewFieldGroups;
            if (!isDefined(createdViewFieldGroups)) {
              return;
            }

            triggerViewFieldGroupOptimisticEffect({
              createdViewFieldGroups,
            });
          },
        });

        return {
          status: 'successful',
          response: result.data ?? null,
        };
      } catch (error) {
        if (
          typeof error === 'object' &&
          error !== null &&
          'graphQLErrors' in error
        ) {
          handleMetadataError(error as ApolloError, {
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
      triggerViewFieldGroupOptimisticEffect,
      createManyCoreViewFieldGroupsMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
    ],
  );

  const performViewFieldGroupAPIUpdate = useCallback(
    async (
      updateCoreViewFieldGroupInputs: MutationUpdateCoreViewFieldGroupArgs[],
    ): Promise<
      MetadataRequestResult<UpdateCoreViewFieldGroupMutationResult[] | null>
    > => {
      if (updateCoreViewFieldGroupInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          updateCoreViewFieldGroupInputs.map((variables) =>
            updateCoreViewFieldGroupMutation({
              variables,
              update: (_cache, { data }) => {
                const updatedViewFieldGroup = data?.updateCoreViewFieldGroup;
                if (!isDefined(updatedViewFieldGroup)) {
                  return;
                }

                triggerViewFieldGroupOptimisticEffect({
                  updatedViewFieldGroups: [updatedViewFieldGroup],
                });
              },
            }),
          ),
        );

        return {
          status: 'successful',
          response: results
            .map((r) => r.data)
            .filter(isDefined) as UpdateCoreViewFieldGroupMutationResult[],
        };
      } catch (error) {
        if (
          typeof error === 'object' &&
          error !== null &&
          'graphQLErrors' in error
        ) {
          handleMetadataError(error as ApolloError, {
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
      triggerViewFieldGroupOptimisticEffect,
      updateCoreViewFieldGroupMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
    ],
  );

  const performViewFieldGroupAPIDelete = useCallback(
    async (
      deleteCoreViewFieldGroupInputs: MutationDeleteCoreViewFieldGroupArgs[],
    ): Promise<
      MetadataRequestResult<DeleteCoreViewFieldGroupMutationResult[] | null>
    > => {
      if (deleteCoreViewFieldGroupInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          deleteCoreViewFieldGroupInputs.map((variables) =>
            deleteCoreViewFieldGroupMutation({
              variables,
              update: (_cache, { data }) => {
                const deletedViewFieldGroup = data?.deleteCoreViewFieldGroup;
                if (!isDefined(deletedViewFieldGroup)) {
                  return;
                }

                triggerViewFieldGroupOptimisticEffect({
                  deletedViewFieldGroups: [deletedViewFieldGroup],
                });
              },
            }),
          ),
        );

        return {
          status: 'successful',
          response: results
            .map((r) => r.data)
            .filter(isDefined) as DeleteCoreViewFieldGroupMutationResult[],
        };
      } catch (error) {
        if (
          typeof error === 'object' &&
          error !== null &&
          'graphQLErrors' in error
        ) {
          handleMetadataError(error as ApolloError, {
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
      triggerViewFieldGroupOptimisticEffect,
      deleteCoreViewFieldGroupMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
    ],
  );

  return {
    performViewFieldGroupAPICreate,
    performViewFieldGroupAPIUpdate,
    performViewFieldGroupAPIDelete,
  };
};
