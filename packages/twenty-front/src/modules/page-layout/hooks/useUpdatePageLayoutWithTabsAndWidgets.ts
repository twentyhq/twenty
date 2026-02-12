import {
  type UpdatePageLayoutWithTabsInput,
  useUpdatePageLayoutWithTabsAndWidgetsMutation,
} from '~/generated-metadata/graphql';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';

export const useUpdatePageLayoutWithTabsAndWidgets = () => {
  const [updatePageLayoutWithTabsAndWidgetsMutation] =
    useUpdatePageLayoutWithTabsAndWidgetsMutation();

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const updatePageLayoutWithTabsAndWidgets = async (
    id: string,
    input: UpdatePageLayoutWithTabsInput,
  ): Promise<
    MetadataRequestResult<
      Awaited<ReturnType<typeof updatePageLayoutWithTabsAndWidgetsMutation>>
    >
  > => {
    try {
      const updatedPageLayout =
        await updatePageLayoutWithTabsAndWidgetsMutation({
          variables: {
            id,
            input,
          },
        });

      return {
        status: 'successful',
        response: updatedPageLayout,
      };
    } catch (error) {
      if (error instanceof ApolloError) {
        handleMetadataError(error, {
          primaryMetadataName: 'pageLayout',
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
  };

  return {
    updatePageLayoutWithTabsAndWidgets,
  };
};
