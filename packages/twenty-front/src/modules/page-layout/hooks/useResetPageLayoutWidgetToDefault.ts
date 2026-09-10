import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { CrudOperationType } from 'twenty-shared/types';
import { ResetPageLayoutWidgetToDefaultDocument } from '~/generated-metadata/graphql';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useRefreshPageLayoutAfterReset } from '@/page-layout/hooks/useRefreshPageLayoutAfterReset';
import { useToast } from 'twenty-ui/feedback';

export const useResetPageLayoutWidgetToDefault = (
  pageLayoutIdFromProps: string,
) => {
  const [resetMutation] = useMutation(ResetPageLayoutWidgetToDefaultDocument);
  const { handleMetadataError } = useMetadataErrorHandler();
  const { add: addToast } = useToast();
  const { refreshPageLayoutAfterReset } = useRefreshPageLayoutAfterReset(
    pageLayoutIdFromProps,
  );

  const resetPageLayoutWidgetToDefault = useCallback(
    async (widgetId: string) => {
      try {
        await resetMutation({ variables: { id: widgetId } });
        await refreshPageLayoutAfterReset();
      } catch (error) {
        if (CombinedGraphQLErrors.is(error)) {
          handleMetadataError(error, {
            primaryMetadataName: 'pageLayoutWidget',
            operationType: CrudOperationType.UPDATE,
          });
        } else {
          addToast({ variant: 'error', children: t`An error occurred.` });
        }
      }
    },
    [resetMutation, refreshPageLayoutAfterReset, handleMetadataError, addToast],
  );

  return { resetPageLayoutWidgetToDefault };
};
