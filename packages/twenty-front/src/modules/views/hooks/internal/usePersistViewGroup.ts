import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useTriggerViewGroupOptimisticEffect } from '@/views/optimistic-effects/hooks/useTriggerViewGroupOptimisticEffect';
import { ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  type UpdateCoreViewGroupMutationVariables,
  useUpdateCoreViewGroupMutation,
} from '~/generated/graphql';

export const usePersistViewGroupRecords = () => {
  const { triggerViewGroupOptimisticEffect } =
    useTriggerViewGroupOptimisticEffect();

  const [updateCoreViewGroupMutation] = useUpdateCoreViewGroupMutation();

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const updateViewGroups = useCallback(
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
        if (error instanceof ApolloError) {
          handleMetadataError(error, {
            primaryMetadataName: 'viewGroup',
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
    updateViewGroups,
  };
};
