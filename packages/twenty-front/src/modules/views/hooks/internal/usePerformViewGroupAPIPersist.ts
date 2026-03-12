import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useTriggerViewGroupOptimisticEffect } from '@/views/optimistic-effects/hooks/useTriggerViewGroupOptimisticEffect';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useMutation } from '@apollo/client/react';
import {
  type UpdateCoreViewGroupMutationVariables,
  UpdateCoreViewGroupDocument,
} from '~/generated-metadata/graphql';

export const usePerformViewGroupAPIPersist = () => {
  const { triggerViewGroupOptimisticEffect } =
    useTriggerViewGroupOptimisticEffect();

  const [updateCoreViewGroupMutation] = useMutation(UpdateCoreViewGroupDocument);

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const performViewGroupAPIUpdate = useCallback(
    async (
      updateCoreViewGroupInputs: UpdateCoreViewGroupMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof updateCoreViewGroupMutation>>[]
      >
    > => {
      if (updateCoreViewGroupInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          updateCoreViewGroupInputs.map((variables) =>
            updateCoreViewGroupMutation({
              variables,
              update: (_cache, { data }) => {
                const updatedViewGroup = data?.updateCoreViewGroup;
                if (!isDefined(updatedViewGroup)) {
                  return;
                }

                triggerViewGroupOptimisticEffect({
                  updatedViewGroups: [updatedViewGroup],
                });
              },
            }),
          ),
        );

        return {
          status: 'successful',
          response: results,
        };
      } catch (error) {
        if (error instanceof CombinedGraphQLErrors) {
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
      triggerViewGroupOptimisticEffect,
      updateCoreViewGroupMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
    ],
  );

  return {
    performViewGroupAPIUpdate,
  };
};
