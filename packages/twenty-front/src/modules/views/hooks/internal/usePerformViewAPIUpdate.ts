import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { coreViewsState } from '@/views/states/coreViewState';
import { ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { useSetRecoilState } from 'recoil';
import { CrudOperationType } from 'twenty-shared/types';
import { upsertPropertiesOfItemIntoArrayOfObjectsComparingId } from 'twenty-shared/utils';
import {
  type CoreView,
  type UpdateCoreViewMutationVariables,
  useUpdateCoreViewMutation,
} from '~/generated-metadata/graphql';

export const usePerformViewAPIUpdate = () => {
  const [updateCoreViewMutation] = useUpdateCoreViewMutation();

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const setCoreViews = useSetRecoilState(coreViewsState);

  const performViewAPIUpdate = useCallback(
    async (
      variables: UpdateCoreViewMutationVariables,
    ): Promise<
      MetadataRequestResult<Awaited<ReturnType<typeof updateCoreViewMutation>>>
    > => {
      try {
        setCoreViews((currentCoreViews) =>
          upsertPropertiesOfItemIntoArrayOfObjectsComparingId(
            currentCoreViews,
            {
              ...variables.input,
              id: variables.id,
            } as CoreView,
          ),
        );

        const result = await updateCoreViewMutation({
          variables,
        });

        setCoreViews((currentCoreViews) =>
          upsertPropertiesOfItemIntoArrayOfObjectsComparingId(
            currentCoreViews,
            {
              ...result.data?.updateCoreView,
              id: variables.id,
            } as CoreView,
          ),
        );

        return {
          status: 'successful',
          response: result,
        };
      } catch (error) {
        if (error instanceof ApolloError) {
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
      setCoreViews,
      updateCoreViewMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
    ],
  );

  return { performViewAPIUpdate };
};
