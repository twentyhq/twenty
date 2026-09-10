import { useMutation } from '@apollo/client/react';
import {
  type UpdatePageLayoutWithTabsInput,
  UpdatePageLayoutWithTabsAndWidgetsDocument,
} from '~/generated-metadata/graphql';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';
import { useToast } from 'twenty-ui/feedback';

export const useUpdatePageLayoutWithTabsAndWidgets = () => {
  const [updatePageLayoutWithTabsAndWidgetsMutation] = useMutation(
    UpdatePageLayoutWithTabsAndWidgetsDocument,
  );

  const { handleMetadataError } = useMetadataErrorHandler();
  const { add: addToast } = useToast();

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
      if (CombinedGraphQLErrors.is(error)) {
        handleMetadataError(error, {
          primaryMetadataName: 'pageLayout',
          operationType: CrudOperationType.UPDATE,
        });
      } else {
        addToast({ variant: 'error', children: t`An error occurred.` });
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
